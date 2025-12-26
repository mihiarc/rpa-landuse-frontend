import { NextRequest } from "next/server";

export const maxDuration = 60;

/**
 * Transform SSE stream from backend to AI SDK Data Stream Protocol.
 *
 * Backend format:
 *   data: {"type": "content", "content": "Hello"}
 *   data: {"type": "complete"}
 *   data: [DONE]
 *
 * AI SDK format:
 *   0:"Hello"
 *   d:{"finishReason":"stop"}
 */
function createStreamTransformer(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();

          if (data === "[DONE]") {
            // Send finish message
            controller.enqueue(encoder.encode(`d:${JSON.stringify({ finishReason: "stop" })}\n`));
            return;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "content" && parsed.content) {
              // Text content - use code 0
              controller.enqueue(encoder.encode(`0:${JSON.stringify(parsed.content)}\n`));
            } else if (parsed.type === "error") {
              // Error - use code 3
              controller.enqueue(encoder.encode(`3:${JSON.stringify(parsed.content || "Unknown error")}\n`));
            }
            // Ignore "start" and "complete" types - AI SDK handles these differently
          } catch {
            // Ignore parse errors
          }
        }
      }
    },
    flush(controller) {
      // Process any remaining buffer
      if (buffer.trim()) {
        if (buffer.startsWith("data: ")) {
          const data = buffer.slice(6).trim();
          if (data !== "[DONE]") {
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content" && parsed.content) {
                controller.enqueue(encoder.encode(`0:${JSON.stringify(parsed.content)}\n`));
              }
            } catch {
              // Ignore
            }
          }
        }
      }
      // Always send finish at the end
      controller.enqueue(encoder.encode(`d:${JSON.stringify({ finishReason: "stop" })}\n`));
    },
  });
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Extract the last user message as the question
  // The AI SDK sends messages array, but backend expects { question: string }
  const lastUserMessage = messages
    .filter((m: { role: string }) => m.role === "user")
    .pop();
  const question = lastUserMessage?.content || "";

  try {
    // Forward cookies from the client to the backend for authentication
    const cookies = req.headers.get("cookie") || "";

    const response = await fetch(`${backendUrl}/api/v1/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!response.body) {
      return new Response(JSON.stringify({ error: "No response body" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform the SSE stream to AI SDK format
    const transformedStream = response.body.pipeThrough(createStreamTransformer());

    // Extract Set-Cookie headers from backend response to forward token refreshes
    const setCookieHeaders = response.headers.getSetCookie();

    // Build response headers, including any Set-Cookie headers from backend
    const responseHeaders = new Headers({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Add Set-Cookie headers from backend (e.g., refreshed tokens)
    setCookieHeaders.forEach((cookie) => {
      responseHeaders.append("Set-Cookie", cookie);
    });

    return new Response(transformedStream, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Backend error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to connect to backend" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

import { NextRequest } from "next/server";

export const maxDuration = 60;

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

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
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

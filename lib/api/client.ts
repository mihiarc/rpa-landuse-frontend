import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private client: AxiosInstance;
  private sessionId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 120000, // 2 minutes for long queries
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      if (this.sessionId) {
        config.headers["X-Session-ID"] = this.sessionId;
      }
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers["retry-after"];
          return Promise.reject({
            type: "rate_limit",
            message: "Rate limit exceeded. Please wait before making more requests.",
            retryAfter: parseInt(retryAfter as string || "60"),
          });
        }

        // Extract error message from response
        const errorData = error.response?.data as { detail?: string; error?: string; message?: string } | undefined;
        const message = errorData?.detail || errorData?.error || errorData?.message || error.message;

        return Promise.reject({
          type: "api_error",
          message,
          status: error.response?.status,
        });
      }
    );
  }

  setSessionId(id: string) {
    this.sessionId = id;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.client.get<T, T>(url, { params });
  }

  async post<T = unknown>(url: string, data?: unknown): Promise<T> {
    return this.client.post<T, T>(url, data);
  }

  async delete<T = unknown>(url: string): Promise<T> {
    return this.client.delete<T, T>(url);
  }

  /**
   * Stream chat response using Server-Sent Events
   */
  async *streamChat(question: string): AsyncGenerator<{ type: string; content?: string }, void, unknown> {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.sessionId && { "X-Session-ID": this.sessionId }),
      },
      body: JSON.stringify({ question, session_id: this.sessionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            yield parsed;
          } catch {
            // Ignore parse errors for partial chunks
          }
        }
      }
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}

class ApiClient {
  private client: AxiosInstance;
  private sessionId: string | null = null;
  private isRefreshing = false;
  private failedRequestsQueue: QueuedRequest[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 120000, // 2 minutes for long queries
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Include cookies for auth
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
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Don't retry auth endpoints to prevent infinite loops
          const isAuthEndpoint = originalRequest.url?.includes("/auth/");
          if (isAuthEndpoint) {
            return this.handleAuthError();
          }

          originalRequest._retry = true;

          if (this.isRefreshing) {
            // Queue the request while refresh is in progress
            return new Promise((resolve, reject) => {
              this.failedRequestsQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          this.isRefreshing = true;

          try {
            // Attempt to refresh the token
            const refreshResponse = await fetch("/api/auth/refresh", {
              method: "POST",
              credentials: "include",
            });

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();

              if (data.authenticated) {
                // Token refresh successful, retry all queued requests
                this.processQueue(null);
                this.isRefreshing = false;

                // Retry the original request
                return this.client(originalRequest);
              }
            }

            // Token refresh failed
            throw new Error("Token refresh failed");
          } catch (refreshError) {
            // Clear queue and redirect to login
            this.processQueue(refreshError);
            this.isRefreshing = false;
            return this.handleAuthError();
          }
        }

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

  /**
   * Process the queue of failed requests after token refresh
   */
  private processQueue(error: unknown) {
    this.failedRequestsQueue.forEach((request) => {
      if (error) {
        request.reject(error);
      } else {
        request.resolve(null);
      }
    });
    this.failedRequestsQueue = [];
  }

  /**
   * Handle authentication errors by redirecting to login
   */
  private handleAuthError() {
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      // Try to use Next.js router if available, otherwise fall back to window.location
      const router = (window as typeof window & { __NEXT_ROUTER__?: { push?: (url: string) => void } }).__NEXT_ROUTER__;
      if (router?.push) {
        router.push("/login");
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject({
      type: "auth_error",
      message: "Authentication required",
      status: 401,
    });
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
      credentials: "include", // Include cookies for auth
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

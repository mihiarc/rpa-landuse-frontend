import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AuthResponse {
  authenticated: boolean;
  message: string;
}

interface AcademicAuthResponse {
  authenticated: boolean;
  email: string;
  queries_remaining: number;
  daily_limit: number;
  message: string;
}

export function useAuth() {
  const {
    isAuthenticated,
    isLoading,
    error,
    email,
    tier,
    queriesRemaining,
    dailyLimit,
    setAuthenticated,
    setLoading,
    setError,
    setAcademicUser,
    updateQueriesRemaining,
    reset,
  } = useAuthStore();

  const login = useCallback(async (password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const data: AuthResponse = await response.json();

      if (data.authenticated) {
        setAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        setError(data.message);
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError("Failed to connect to server");
      setLoading(false);
      return false;
    }
  }, [setAuthenticated, setLoading, setError]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore logout errors
    }
    reset();
  }, [reset]);

  const verify = useCallback(async (): Promise<boolean> => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
        method: "GET",
        credentials: "include",
      });

      const data: AuthResponse = await response.json();

      setAuthenticated(data.authenticated);
      setLoading(false);
      return data.authenticated;
    } catch {
      setAuthenticated(false);
      setLoading(false);
      return false;
    }
  }, [setAuthenticated, setLoading]);

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      const data: AuthResponse = await response.json();

      if (data.authenticated) {
        setAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [setAuthenticated]);

  const registerEmail = useCallback(
    async (userEmail: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/auth/register-academic`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email: userEmail }),
          }
        );

        const data: AcademicAuthResponse = await response.json();

        if (data.authenticated) {
          setAuthenticated(true);
          setAcademicUser({
            email: data.email,
            tier: "academic",
            queriesRemaining: data.queries_remaining,
            dailyLimit: data.daily_limit,
          });
          setLoading(false);
        } else {
          setError(data.message);
          setLoading(false);
          throw new Error(data.message);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to register";
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    [setAuthenticated, setLoading, setError, setAcademicUser]
  );

  const fetchAcademicStatus = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/academic-status`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data: AcademicAuthResponse = await response.json();

      if (data.authenticated && data.email) {
        setAcademicUser({
          email: data.email,
          tier: data.queries_remaining === 999999 ? "admin" : "academic",
          queriesRemaining: data.queries_remaining,
          dailyLimit: data.daily_limit,
        });
      }
    } catch {
      // Ignore errors fetching status
    }
  }, [setAcademicUser]);

  return {
    isAuthenticated,
    isLoading,
    error,
    email,
    tier,
    queriesRemaining,
    dailyLimit,
    login,
    logout,
    verify,
    refresh,
    registerEmail,
    fetchAcademicStatus,
    updateQueriesRemaining,
  };
}

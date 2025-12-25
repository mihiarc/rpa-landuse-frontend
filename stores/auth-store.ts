import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Academic user info
  email: string | null;
  tier: string | null;
  queriesRemaining: number | null;
  dailyLimit: number | null;

  // Actions
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAcademicUser: (info: {
    email: string;
    tier: string;
    queriesRemaining: number;
    dailyLimit: number;
  }) => void;
  updateQueriesRemaining: (remaining: number) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  error: null,
  email: null,
  tier: null,
  queriesRemaining: null,
  dailyLimit: null,

  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setAcademicUser: (info) =>
    set({
      email: info.email,
      tier: info.tier,
      queriesRemaining: info.queriesRemaining,
      dailyLimit: info.dailyLimit,
    }),
  updateQueriesRemaining: (remaining) => set({ queriesRemaining: remaining }),
  reset: () =>
    set({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      email: null,
      tier: null,
      queriesRemaining: null,
      dailyLimit: null,
    }),
}));

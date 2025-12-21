import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sqlQuery?: string;
  isStreaming?: boolean;
}

interface ChatState {
  messages: Message[];
  sessionId: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  addMessage: (message: Omit<Message, "id" | "timestamp">) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  appendToMessage: (id: string, content: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSessionId: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      sessionId: generateId(),
      isLoading: false,
      error: null,

      addMessage: (message) => {
        const id = generateId();
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id,
              timestamp: new Date(),
            },
          ],
        }));
        return id;
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        }));
      },

      appendToMessage: (id, content) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content: msg.content + content } : msg
          ),
        }));
      },

      clearMessages: () => {
        set({
          messages: [],
          sessionId: generateId(),
          error: null,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setSessionId: (id) => set({ sessionId: id }),
    }),
    {
      name: "rpa-chat-storage",
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        sessionId: state.sessionId,
      }),
    }
  )
);

"use client";

import { useCallback } from "react";
import { useChatStore } from "@/stores/chat-store";
import { apiClient } from "@/lib/api/client";

export function useChat() {
  const {
    messages,
    sessionId,
    isLoading,
    error,
    addMessage,
    updateMessage,
    appendToMessage,
    clearMessages,
    setLoading,
    setError,
  } = useChatStore();

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || isLoading) return;

      setError(null);
      setLoading(true);

      // Add user message
      addMessage({
        role: "user",
        content: question.trim(),
      });

      // Add placeholder for assistant response
      const assistantId = addMessage({
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      try {
        // Set session ID on API client
        apiClient.setSessionId(sessionId);

        // Stream the response
        for await (const chunk of apiClient.streamChat(question)) {
          if (chunk.type === "content" && chunk.content) {
            appendToMessage(assistantId, chunk.content);
          } else if (chunk.type === "error") {
            setError(chunk.content || "An error occurred");
            updateMessage(assistantId, {
              content: chunk.content || "An error occurred while processing your request.",
              isStreaming: false,
            });
            break;
          } else if (chunk.type === "complete") {
            updateMessage(assistantId, { isStreaming: false });
          }
        }

        updateMessage(assistantId, { isStreaming: false });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        updateMessage(assistantId, {
          content: `Error: ${errorMessage}`,
          isStreaming: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [sessionId, isLoading, addMessage, updateMessage, appendToMessage, setLoading, setError]
  );

  const clearChat = useCallback(async () => {
    try {
      await apiClient.delete(`/chat/history?session_id=${sessionId}`);
    } catch {
      // Ignore errors when clearing history
    }
    clearMessages();
  }, [sessionId, clearMessages]);

  const exportChat = useCallback(() => {
    const exportData = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    exportChat,
  };
}

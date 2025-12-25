"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    error,
    reload,
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Welcome to the RPA Land Use Explorer!

I can help you understand land use changes across the United States using data from the **USDA Forest Service RPA Assessment**.

The dataset contains **5.4 million land use transition records** across 3,075 US counties and 20 climate scenarios.

**Try asking:**
- "Which states have the most forest loss?"
- "Compare urbanization across climate scenarios"
- "Show agricultural land changes in Texas"
- "What percentage of new urban land comes from forest?"

All statistics are computed from official USDA Forest Service projections.`,
      },
    ],
  });

  const suggestions = [
    "Which states have the most forest loss?",
    "Compare urbanization across scenarios",
    "Show forest changes in California",
    "Urban land from forest conversion",
  ];

  return (
    <div className="container mx-auto max-w-4xl">
      <ChatInterface
        messages={messages}
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={stop}
        error={error}
        onReload={reload}
        suggestions={suggestions}
      />
    </div>
  );
}

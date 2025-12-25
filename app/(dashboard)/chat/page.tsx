"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Trash2, Download, AlertCircle } from "lucide-react";
import { useChat } from "@/lib/hooks/use-chat";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";

const EXAMPLE_QUERIES = [
  "Which states have the most forest loss?",
  "Compare urbanization across climate scenarios",
  "Show agricultural land changes in Texas",
  "What percentage of new urban land comes from forest?",
];

export default function ChatPage() {
  const { messages, isLoading, error, sendMessage, clearChat, exportChat } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleExampleClick = (query: string) => {
    sendMessage(query);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Natural Language Chat
            </h1>
            <p className="text-sm text-muted-foreground">
              Ask questions about RPA land use data in plain English
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportChat}
              disabled={messages.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-3 flex items-center gap-2 text-destructive shrink-0">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              /* Welcome Message */
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Welcome to RPA Land Use Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    I can help you explore the USDA Forest Service RPA Assessment
                    data. The dataset contains 5.4 million land use transition
                    records across 3,075 US counties and 20 climate scenarios.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try asking questions like:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {EXAMPLE_QUERIES.map((query) => (
                      <Button
                        key={query}
                        variant="outline"
                        className="justify-start text-left h-auto py-2 px-3"
                        onClick={() => handleExampleClick(query)}
                        disabled={isLoading}
                      >
                        {query}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Message List */
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  isStreaming={message.isStreaming}
                />
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

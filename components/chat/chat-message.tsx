"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

/**
 * Normalize content for proper markdown and LaTeX rendering:
 * 1. Convert LaTeX delimiters: [ ... ] -> $$ ... $$ and \( ... \) -> $ ... $
 * 2. Ensure proper newlines around markdown elements (headings, lists)
 */
function normalizeContent(content: string): string {
  let normalized = content;

  // Convert display math: [ ... ] -> $$ ... $$
  // Match [ followed by LaTeX-like content (with backslashes) and ]
  normalized = normalized.replace(/\[\s*(\\[^[\]]+)\s*\]/g, '$$$$$1$$$$');

  // Convert inline math: \( ... \) -> $ ... $
  normalized = normalized.replace(/\\\(([^)]+)\\\)/g, '$$$1$$');

  // Ensure newlines before markdown headings (# ## ### etc.)
  // Look for # at start or after non-newline characters
  normalized = normalized.replace(/([^\n])(\n?)(#{1,6}\s)/g, '$1\n\n$3');

  // Ensure newlines before list items (- or * or numbered)
  // Only add if not already at start of line
  normalized = normalized.replace(/([^\n])\n([-*]\s)/g, '$1\n\n$2');
  normalized = normalized.replace(/([^\n])\n(\d+\.\s)/g, '$1\n\n$2');

  // Ensure blank line after headings if followed by text
  normalized = normalized.replace(/(#{1,6}\s[^\n]+)\n([^#\n-*\d])/g, '$1\n\n$2');

  return normalized;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser ? "bg-muted/50" : "bg-background"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            isUser ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="font-medium text-sm">
          {isUser ? "You" : "RPA Assistant"}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                pre: ({ children }) => (
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                    {children}
                  </pre>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className="font-mono">{children}</code>
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      {children}
                    </table>
                  </div>
                ),
              }}
            >
              {normalizeContent(content)}
            </ReactMarkdown>
          ) : isStreaming ? (
            <div className="flex items-center gap-1">
              <span className="animate-pulse">Thinking</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
              <span className="animate-bounce delay-300">.</span>
            </div>
          ) : null}

          {isStreaming && content && (
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
          )}
        </div>
      </div>
    </div>
  );
}

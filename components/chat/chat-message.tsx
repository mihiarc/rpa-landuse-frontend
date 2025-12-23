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
 * Normalize content for proper rendering.
 * Handles LaTeX delimiters and ensures markdown tables have proper newlines.
 */
function normalizeContent(content: string): string {
  let normalized = content;

  // Convert display math: [ ... ] -> $$ ... $$ (LLM sometimes uses brackets)
  normalized = normalized.replace(/\[\s*(\\[^[\]]+)\s*\]/g, '$$$$$1$$$$');

  // Convert inline math: \( ... \) -> $ ... $
  normalized = normalized.replace(/\\\(([^)]+)\\\)/g, '$$$1$$');

  // Fix markdown tables: ensure newlines before/after pipe tables
  // Match table pattern: | header | header | followed by |---|---| rows
  normalized = normalized.replace(
    /([^\n])\s*(\|[^\n]+\|\s*\n\s*\|[-:|\s]+\|)/g,
    '$1\n\n$2'
  );

  // Ensure newline after table ends (before non-pipe text)
  normalized = normalized.replace(
    /(\|[^\n]+\|)\s*\n\s*([^|\n])/g,
    '$1\n\n$2'
  );

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
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-border rounded-lg overflow-hidden">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted/50">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-border">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-sm font-semibold text-foreground border-b border-border">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-foreground/90">
                    {children}
                  </td>
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

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
 * 2. Fix tables that are on single lines
 * 3. Fix numbered lists that are inline
 * 4. Ensure proper newlines around markdown elements
 */
function normalizeContent(content: string): string {
  let normalized = content;

  // Convert display math: [ ... ] -> $$ ... $$
  normalized = normalized.replace(/\[\s*(\\[^[\]]+)\s*\]/g, '$$$$$1$$$$');

  // Convert inline math: \( ... \) -> $ ... $
  normalized = normalized.replace(/\\\(([^)]+)\\\)/g, '$$$1$$');

  // FIX TABLES: The LLM outputs tables on one line like:
  // "| Col1 | Col2 | |------|------| | Val1 | Val2 | | Val3 | Val4 |"
  // We need to split at "| |" boundaries to create proper rows

  // Step 1: Add newline before alignment row (|---|---|)
  // This pattern: "| |---" or "| |:--" indicates start of alignment row
  normalized = normalized.replace(/\|\s+\|(\s*[-:]+)/g, '|\n|$1');

  // Step 2: Add newline after alignment row ends and before data rows start
  // Pattern: "---| |" followed by a letter/number indicates end of alignment, start of data
  normalized = normalized.replace(/([-:]+\|)\s+\|\s*([A-Za-z0-9])/g, '$1\n| $2');

  // Step 3: Add newline between data rows
  // Pattern: "| |" followed by text (but not dashes)
  normalized = normalized.replace(/\|\s+\|\s*([A-Za-z0-9])/g, '|\n| $1');

  // Fix numbered lists that are inline: "1. Item text 2. Item text"
  normalized = normalized.replace(/([.!?:,])\s+(\d+)\.\s+([A-Z])/g, '$1\n\n$2. $3');

  // Also handle cases like "text: 1. Item"
  normalized = normalized.replace(/:\s*(\d+)\.\s+/g, ':\n\n$1. ');

  // Fix bullet lists that are inline
  normalized = normalized.replace(/([.!?])\s+([-*])\s+/g, '$1\n\n$2 ');

  // Ensure newlines before markdown headings (# ## ### etc.)
  normalized = normalized.replace(/([^\n])(\s*)(#{1,6}\s)/g, '$1\n\n$3');

  // Ensure blank line before bold section headers like "**Section:**"
  normalized = normalized.replace(/([.!?])\s+(\*\*[^*]+:\*\*)/g, '$1\n\n$2');

  // Ensure newlines before "Insights:", "Conclusion:", etc.
  normalized = normalized.replace(/([.!?])\s+(Insights|Conclusion|Summary|Analysis|Results|Key Findings):/gi, '$1\n\n**$2:**');

  // Clean up multiple consecutive newlines (more than 2)
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

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

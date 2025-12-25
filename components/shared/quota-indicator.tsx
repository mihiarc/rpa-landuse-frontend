"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Displays remaining AI query quota for academic users.
 * Shows a progress bar and remaining count.
 */
export function QuotaIndicator() {
  const {
    tier,
    queriesRemaining,
    dailyLimit,
    fetchAcademicStatus,
  } = useAuth();

  // Fetch quota status on mount
  useEffect(() => {
    fetchAcademicStatus();
  }, [fetchAcademicStatus]);

  // Don't show for admin users (unlimited access)
  if (tier !== "academic" || queriesRemaining === null || dailyLimit === null) {
    return null;
  }

  const percentRemaining = (queriesRemaining / dailyLimit) * 100;
  const isLow = queriesRemaining <= 10;
  const isEmpty = queriesRemaining <= 0;

  return (
    <div className="px-3 py-3 border-t">
      <div className="flex items-center gap-2 mb-2">
        {isEmpty ? (
          <AlertTriangle className="h-4 w-4 text-destructive" />
        ) : isLow ? (
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        ) : (
          <Sparkles className="h-4 w-4 text-green-600" />
        )}
        <span
          className={cn(
            "text-sm font-medium",
            isEmpty && "text-destructive",
            isLow && !isEmpty && "text-yellow-600"
          )}
        >
          {queriesRemaining} queries left
        </span>
      </div>
      <Progress
        value={percentRemaining}
        className={cn(
          "h-2",
          isEmpty && "[&>div]:bg-destructive",
          isLow && !isEmpty && "[&>div]:bg-yellow-600"
        )}
      />
      <p className="text-xs text-muted-foreground mt-1">
        {dailyLimit} per day · Resets at midnight
      </p>
    </div>
  );
}

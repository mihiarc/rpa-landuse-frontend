"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface ExtractionTemplate {
  id: string;
  name: string;
  description: string;
  estimated_rows: number;
}

interface FilterOption {
  id: string;
  name: string;
}

interface FilterOptions {
  scenarios: FilterOption[];
  land_use_types: FilterOption[];
  time_periods: FilterOption[];
  states: FilterOption[];
}

interface ExtractionPreview {
  success: boolean;
  row_count: number;
  columns?: string[];
  preview?: Array<Record<string, unknown>>;
  error?: string;
}

interface ExtractionRequest {
  template_id?: string;
  custom_query?: string;
  states?: string[];
  scenarios?: string[];
  time_periods?: number[];
  land_use_types?: string[];
  format?: "csv" | "json";
  limit?: number;
}

export function useExtractionTemplates() {
  return useQuery<{ templates: ExtractionTemplate[] }>({
    queryKey: ["extraction", "templates"],
    queryFn: () => apiClient.get<{ templates: ExtractionTemplate[] }>("/extraction/templates"),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useFilterOptions() {
  return useQuery<FilterOptions>({
    queryKey: ["extraction", "filters"],
    queryFn: () => apiClient.get<FilterOptions>("/extraction/filters"),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useExtractionPreview() {
  const [preview, setPreview] = useState<ExtractionPreview | null>(null);

  const mutation = useMutation({
    mutationFn: async (request: ExtractionRequest) => {
      return apiClient.post<ExtractionPreview>("/extraction/preview", request);
    },
    onSuccess: (data) => {
      setPreview(data);
    },
    onError: (error: { message?: string }) => {
      setPreview({
        success: false,
        row_count: 0,
        error: error.message || "Preview failed",
      });
    },
  });

  const previewExtraction = useCallback(
    (request: ExtractionRequest) => {
      mutation.mutate(request);
    },
    [mutation]
  );

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return {
    preview,
    isLoading: mutation.isPending,
    previewExtraction,
    clearPreview,
  };
}

export function useExtractionExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = useCallback(async (request: ExtractionRequest) => {
    setIsExporting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/extraction/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `export-${new Date().toISOString().split("T")[0]}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=([^;]+)/);
        if (match) {
          filename = match[1];
        }
      }

      // Add extension based on format
      const format = request.format || "csv";
      if (!filename.endsWith(`.${format}`)) {
        filename += `.${format}`;
      }

      // Create blob and download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportData,
    isExporting,
  };
}

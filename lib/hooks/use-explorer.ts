"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface TableColumn {
  name: string;
  type: string;
}

interface TableInfo {
  name: string;
  type: string;
  row_count: number;
  columns: TableColumn[];
}

interface ViewInfo {
  name: string;
  description: string;
}

interface SchemaResponse {
  tables: TableInfo[];
  views: ViewInfo[];
  total_rows: number;
}

interface QueryResult {
  success: boolean;
  columns: string[];
  data: Array<Record<string, unknown>>;
  row_count: number;
  execution_time: number;
  error?: string;
  suggestion?: string;
}

interface QueryTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  query: string;
}

export function useSchema() {
  return useQuery<SchemaResponse>({
    queryKey: ["explorer", "schema"],
    queryFn: () => apiClient.get<SchemaResponse>("/explorer/schema"),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useQueryTemplates() {
  return useQuery<{ templates: QueryTemplate[] }>({
    queryKey: ["explorer", "templates"],
    queryFn: () => apiClient.get<{ templates: QueryTemplate[] }>("/explorer/templates"),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useSqlQuery() {
  const [results, setResults] = useState<QueryResult | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ query, limit }: { query: string; limit?: number }) => {
      return apiClient.post<QueryResult>("/explorer/query", { query, limit });
    },
    onSuccess: (data) => {
      setResults(data);
    },
    onError: (error: { message?: string }) => {
      setResults({
        success: false,
        columns: [],
        data: [],
        row_count: 0,
        execution_time: 0,
        error: error.message || "Query failed",
      });
    },
  });

  const executeQuery = useCallback(
    (query: string, limit?: number) => {
      mutation.mutate({ query, limit });
    },
    [mutation]
  );

  const clearResults = useCallback(() => {
    setResults(null);
  }, []);

  return {
    results,
    isLoading: mutation.isPending,
    executeQuery,
    clearResults,
  };
}

/**
 * API type definitions for RPA Land Use Analytics
 */

// Health check types
export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  database: {
    connected: boolean;
    path: string;
    size_mb: number;
    message: string;
  };
  openai: {
    configured: boolean;
    model: string;
    message: string;
  };
  timestamp: string;
}

// Chat types
export interface ChatRequest {
  question: string;
  session_id?: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  sql_query?: string;
  execution_time: number;
  session_id?: string;
}

export interface StreamChunk {
  type: "start" | "content" | "sql" | "complete" | "error";
  content?: string;
  metadata?: Record<string, unknown>;
}

// Analytics types
export interface AnalyticsResponse<T = unknown> {
  data: T[];
  summary?: Record<string, unknown>;
  chart_config?: Record<string, unknown>;
}

export interface OverviewMetrics {
  total_counties: number;
  total_transitions: number;
  scenarios: number;
  time_periods: number;
  land_use_types: number;
}

// Explorer types
export interface SchemaResponse {
  tables: TableSchema[];
  views: ViewSchema[];
  total_rows: number;
}

export interface TableSchema {
  name: string;
  type: "fact" | "dimension";
  row_count: number;
  columns: ColumnSchema[];
}

export interface ViewSchema {
  name: string;
  description: string;
}

export interface ColumnSchema {
  name: string;
  type: string;
}

export interface QueryResultResponse {
  success: boolean;
  columns: string[];
  data: Record<string, unknown>[];
  row_count: number;
  execution_time: number;
  error?: string;
  suggestion?: string;
}

export interface QueryTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  query: string;
}

// Extraction types
export interface ExtractionTemplate {
  id: string;
  name: string;
  description: string;
  estimated_rows: number;
}

export interface FilterOptions {
  scenarios: { id: string; name: string }[];
  land_use_types: { id: string; name: string }[];
  time_periods: { id: string; name: string }[];
  states: { id: string; name: string }[];
}

export interface ExtractionRequest {
  template_id?: string;
  scenarios?: string[];
  states?: string[];
  land_use_from?: string[];
  land_use_to?: string[];
  time_periods?: string[];
  format: "csv" | "json" | "parquet" | "excel";
  limit: number;
}

export interface ExtractionResponse {
  success: boolean;
  row_count: number;
  file_size?: number;
  download_url?: string;
  preview?: Record<string, unknown>[];
}

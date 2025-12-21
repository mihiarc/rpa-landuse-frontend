"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Play,
  FileCode,
  Table,
  Loader2,
  Download,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useSchema, useQueryTemplates, useSqlQuery } from "@/lib/hooks/use-explorer";

const DEFAULT_QUERY = `SELECT
    g.state_name,
    SUM(CAST(f.acres AS DOUBLE)) as total_forest_loss
FROM fact_landuse_transitions f
JOIN dim_geography g ON f.geography_id = g.geography_id
JOIN dim_landuse l_from ON f.from_landuse_id = l_from.landuse_id
WHERE l_from.landuse_name = 'Forest'
GROUP BY g.state_name
ORDER BY total_forest_loss DESC
LIMIT 10`;

export default function ExplorerPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const { data: schema, isLoading: schemaLoading } = useSchema();
  const { data: templatesData } = useQueryTemplates();
  const { results, isLoading: queryLoading, executeQuery } = useSqlQuery();

  const handleExecute = () => {
    if (query.trim()) {
      executeQuery(query);
    }
  };

  const handleTemplateClick = (templateQuery: string) => {
    setQuery(templateQuery);
  };

  const handleTableClick = (tableName: string) => {
    setQuery(`SELECT * FROM ${tableName} LIMIT 10`);
  };

  const exportResults = () => {
    if (!results?.data) return;

    const csv = [
      results.columns.join(","),
      ...results.data.map((row) =>
        results.columns.map((col) => JSON.stringify(row[col] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-results-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6" />
          Data Explorer
        </h1>
        <p className="text-muted-foreground">
          Write SQL queries to explore the RPA land use database
        </p>
      </div>

      <div className="flex-1 grid gap-4 lg:grid-cols-4 min-h-0">
        {/* Schema Browser Sidebar */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Table className="h-4 w-4" />
              Schema Browser
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-4 pb-4">
              {schemaLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Fact Tables */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      FACT TABLES
                    </p>
                    <ul className="space-y-1">
                      {schema?.tables
                        .filter((t) => t.type === "fact")
                        .map((table) => (
                          <li key={table.name}>
                            <button
                              className="w-full text-left text-sm hover:text-primary flex items-center gap-1 py-1"
                              onClick={() => handleTableClick(table.name)}
                            >
                              <ChevronRight className="h-3 w-3" />
                              {table.name}
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {table.row_count.toLocaleString()}
                              </Badge>
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Dimension Tables */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      DIMENSIONS
                    </p>
                    <ul className="space-y-1">
                      {schema?.tables
                        .filter((t) => t.type === "dimension")
                        .map((table) => (
                          <li key={table.name}>
                            <button
                              className="w-full text-left text-sm hover:text-primary flex items-center gap-1 py-1"
                              onClick={() => handleTableClick(table.name)}
                            >
                              <ChevronRight className="h-3 w-3" />
                              {table.name}
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {table.row_count.toLocaleString()}
                              </Badge>
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Views */}
                  {schema?.views && schema.views.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        VIEWS
                      </p>
                      <ul className="space-y-1">
                        {schema.views.map((view) => (
                          <li key={view.name}>
                            <button
                              className="w-full text-left text-sm hover:text-primary flex items-center gap-1 py-1"
                              onClick={() => handleTableClick(view.name)}
                            >
                              <ChevronRight className="h-3 w-3" />
                              {view.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Query Editor and Results */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
          {/* SQL Editor */}
          <Card className="shrink-0">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  SQL Editor
                </CardTitle>
                <Button onClick={handleExecute} disabled={queryLoading || !query.trim()}>
                  {queryLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Execute
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM fact_landuse_transitions LIMIT 10"
                className="min-h-[150px] font-mono text-sm resize-none"
              />
            </CardContent>
          </Card>

          {/* Results Tabs */}
          <Tabs defaultValue="results" className="flex-1 flex flex-col min-h-0">
            <TabsList className="shrink-0">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="flex-1 min-h-0 mt-2">
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 overflow-hidden pt-4">
                  {results ? (
                    <div className="h-full flex flex-col">
                      {/* Status bar */}
                      <div className="flex items-center justify-between mb-2 shrink-0">
                        <div className="flex items-center gap-2">
                          {results.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {results.success
                              ? `${results.row_count} rows in ${results.execution_time.toFixed(3)}s`
                              : results.error}
                          </span>
                        </div>
                        {results.success && results.data.length > 0 && (
                          <Button variant="outline" size="sm" onClick={exportResults}>
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                          </Button>
                        )}
                      </div>

                      {/* Results table */}
                      {results.success && results.data.length > 0 && (
                        <ScrollArea className="flex-1 border rounded-md">
                          <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
                              <tr>
                                {results.columns.map((col) => (
                                  <th
                                    key={col}
                                    className="px-4 py-2 text-left font-medium border-b"
                                  >
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {results.data.map((row, i) => (
                                <tr key={i} className="border-b hover:bg-muted/50">
                                  {results.columns.map((col) => (
                                    <td key={col} className="px-4 py-2 font-mono text-xs">
                                      {row[col] !== null && row[col] !== undefined
                                        ? typeof row[col] === "number"
                                          ? (row[col] as number).toLocaleString()
                                          : String(row[col])
                                        : "NULL"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </ScrollArea>
                      )}

                      {results.success && results.data.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                          Query returned no results
                        </div>
                      )}

                      {!results.success && results.suggestion && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Suggestion: {results.suggestion}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Execute a query to see results
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="flex-1 min-h-0 mt-2">
              <Card className="h-full">
                <CardContent className="pt-4">
                  <ScrollArea className="h-full">
                    <div className="grid gap-3 md:grid-cols-2">
                      {templatesData?.templates?.map((template) => (
                        <Button
                          key={template.id}
                          variant="outline"
                          className="h-auto py-3 justify-start text-left flex-col items-start"
                          onClick={() => handleTemplateClick(template.query)}
                        >
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

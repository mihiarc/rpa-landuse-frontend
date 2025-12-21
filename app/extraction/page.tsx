"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileSpreadsheet,
  Package,
  Loader2,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import {
  useExtractionTemplates,
  useFilterOptions,
  useExtractionPreview,
  useExtractionExport,
} from "@/lib/hooks/use-extraction";

export default function ExtractionPage() {
  const { data: templatesData, isLoading: templatesLoading } = useExtractionTemplates();
  const { data: filterOptions, isLoading: filtersLoading } = useFilterOptions();
  const { preview, isLoading: previewLoading, previewExtraction, clearPreview } = useExtractionPreview();
  const { exportData, isExporting } = useExtractionExport();

  // Custom filter state
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [selectedTimePeriods, setSelectedTimePeriods] = useState<number[]>([]);
  const [selectedLandUseTypes, setSelectedLandUseTypes] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");

  // Template export state
  const [exportingTemplate, setExportingTemplate] = useState<string | null>(null);

  const handleTemplatePreview = (templateId: string) => {
    previewExtraction({ template_id: templateId });
  };

  const handleTemplateExport = async (templateId: string, format: "csv" | "json" = "csv") => {
    setExportingTemplate(templateId);
    try {
      await exportData({ template_id: templateId, format });
    } finally {
      setExportingTemplate(null);
    }
  };

  const handleCustomPreview = () => {
    previewExtraction({
      states: selectedStates.length > 0 ? selectedStates : undefined,
      scenarios: selectedScenarios.length > 0 ? selectedScenarios : undefined,
      time_periods: selectedTimePeriods.length > 0 ? selectedTimePeriods : undefined,
      land_use_types: selectedLandUseTypes.length > 0 ? selectedLandUseTypes : undefined,
    });
  };

  const handleCustomExport = async () => {
    await exportData({
      states: selectedStates.length > 0 ? selectedStates : undefined,
      scenarios: selectedScenarios.length > 0 ? selectedScenarios : undefined,
      time_periods: selectedTimePeriods.length > 0 ? selectedTimePeriods : undefined,
      land_use_types: selectedLandUseTypes.length > 0 ? selectedLandUseTypes : undefined,
      format: exportFormat,
    });
  };

  const toggleSelection = (
    value: string | number,
    current: (string | number)[],
    setter: React.Dispatch<React.SetStateAction<(string | number)[]>>
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value) as never[]);
    } else {
      setter([...current, value] as never[]);
    }
  };

  const clearFilters = () => {
    setSelectedStates([]);
    setSelectedScenarios([]);
    setSelectedTimePeriods([]);
    setSelectedLandUseTypes([]);
    clearPreview();
  };

  const hasFilters =
    selectedStates.length > 0 ||
    selectedScenarios.length > 0 ||
    selectedTimePeriods.length > 0 ||
    selectedLandUseTypes.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Download className="h-6 w-6" />
          Data Extraction
        </h1>
        <p className="text-muted-foreground">
          Export land use data in various formats for your analysis
        </p>
      </div>

      <Tabs defaultValue="predefined" className="space-y-6">
        <TabsList>
          <TabsTrigger value="predefined" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Predefined Extracts
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Custom Extract
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Bulk Export
          </TabsTrigger>
        </TabsList>

        {/* Predefined Extracts Tab */}
        <TabsContent value="predefined">
          <div className="grid gap-4 md:grid-cols-2">
            {templatesLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-60" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              templatesData?.templates?.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        ~{template.estimated_rows.toLocaleString()} rows
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTemplatePreview(template.id)}
                          disabled={previewLoading}
                        >
                          {previewLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4 mr-1" />
                          )}
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleTemplateExport(template.id, "csv")}
                          disabled={exportingTemplate === template.id}
                        >
                          {exportingTemplate === template.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Export CSV
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Preview Results */}
          {preview && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {preview.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    Preview Results
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearPreview}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {preview.success && (
                  <CardDescription>
                    Total rows: {preview.row_count.toLocaleString()} (showing first 10)
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {preview.success && preview.preview && preview.columns ? (
                  <ScrollArea className="h-[300px] border rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          {preview.columns.map((col) => (
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
                        {preview.preview.map((row, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            {preview.columns!.map((col) => (
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
                ) : (
                  <p className="text-destructive">{preview.error || "No data available"}</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Custom Extract Tab */}
        <TabsContent value="custom">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Filter Builder */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Custom Data Extraction</CardTitle>
                    <CardDescription>
                      Build your own extraction with filters
                    </CardDescription>
                  </div>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {filtersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    {/* States Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">States</label>
                      <div className="flex flex-wrap gap-2">
                        {filterOptions?.states?.slice(0, 20).map((state) => (
                          <Badge
                            key={state.id}
                            variant={selectedStates.includes(state.id) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() =>
                              toggleSelection(
                                state.id,
                                selectedStates,
                                setSelectedStates as never
                              )
                            }
                          >
                            {state.id}
                          </Badge>
                        ))}
                        {filterOptions?.states && filterOptions.states.length > 20 && (
                          <Badge variant="secondary">
                            +{filterOptions.states.length - 20} more
                          </Badge>
                        )}
                      </div>
                      {selectedStates.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Selected: {selectedStates.join(", ")}
                        </p>
                      )}
                    </div>

                    {/* Scenarios Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Scenarios</label>
                      <div className="flex flex-wrap gap-2">
                        {filterOptions?.scenarios?.map((scenario) => (
                          <Badge
                            key={scenario.id}
                            variant={
                              selectedScenarios.includes(scenario.id) ? "default" : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() =>
                              toggleSelection(
                                scenario.id,
                                selectedScenarios,
                                setSelectedScenarios as never
                              )
                            }
                          >
                            {scenario.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Land Use Types Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Land Use Types</label>
                      <div className="flex flex-wrap gap-2">
                        {filterOptions?.land_use_types?.map((type) => (
                          <Badge
                            key={type.id}
                            variant={
                              selectedLandUseTypes.includes(type.id) ? "default" : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() =>
                              toggleSelection(
                                type.id,
                                selectedLandUseTypes,
                                setSelectedLandUseTypes as never
                              )
                            }
                          >
                            {type.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Time Periods Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time Periods</label>
                      <div className="flex flex-wrap gap-2">
                        {filterOptions?.time_periods?.map((period) => (
                          <Badge
                            key={period.id}
                            variant={
                              selectedTimePeriods.includes(parseInt(period.id))
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() =>
                              toggleSelection(
                                parseInt(period.id),
                                selectedTimePeriods,
                                setSelectedTimePeriods as never
                              )
                            }
                          >
                            {period.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>Configure your export settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select
                    value={exportFormat}
                    onValueChange={(v) => setExportFormat(v as "csv" | "json")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCustomPreview}
                    disabled={previewLoading}
                  >
                    {previewLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    Preview Data
                  </Button>

                  <Button
                    className="w-full"
                    onClick={handleCustomExport}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export {exportFormat.toUpperCase()}
                  </Button>
                </div>

                {hasFilters && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Active filters:{" "}
                      {[
                        selectedStates.length > 0 && `${selectedStates.length} states`,
                        selectedScenarios.length > 0 && `${selectedScenarios.length} scenarios`,
                        selectedLandUseTypes.length > 0 &&
                          `${selectedLandUseTypes.length} land use types`,
                        selectedTimePeriods.length > 0 &&
                          `${selectedTimePeriods.length} time periods`,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview for custom extraction */}
          {preview && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {preview.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    Preview Results
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearPreview}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {preview.success && (
                  <CardDescription>
                    Total rows: {preview.row_count.toLocaleString()} (showing first 10)
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {preview.success && preview.preview && preview.columns ? (
                  <ScrollArea className="h-[300px] border rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          {preview.columns.map((col) => (
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
                        {preview.preview.map((row, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            {preview.columns!.map((col) => (
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
                ) : (
                  <p className="text-destructive">{preview.error || "No data available"}</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bulk Export Tab */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Data Export</CardTitle>
              <CardDescription>Download complete datasets for offline analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Complete Transitions Dataset</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      All 5.4M transition records across all scenarios, counties, and time periods.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          exportData({
                            template_id: "state_summaries",
                            format: "csv",
                            limit: 1000000,
                          })
                        }
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Export CSV
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          exportData({
                            template_id: "state_summaries",
                            format: "json",
                            limit: 1000000,
                          })
                        }
                        disabled={isExporting}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Scenario Comparison Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Summary data comparing all climate scenarios (RCP/SSP combinations).
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          exportData({ template_id: "scenario_comparison", format: "csv" })
                        }
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Export CSV
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          exportData({ template_id: "scenario_comparison", format: "json" })
                        }
                        disabled={isExporting}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Time Series Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      National trends over time from 2012 to 2100.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          exportData({ template_id: "time_series", format: "csv" })
                        }
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Export CSV
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          exportData({ template_id: "time_series", format: "json" })
                        }
                        disabled={isExporting}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">State Summaries</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Aggregated data by state for all scenarios and transitions.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          exportData({ template_id: "state_summaries", format: "csv" })
                        }
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Export CSV
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          exportData({ template_id: "state_summaries", format: "json" })
                        }
                        disabled={isExporting}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

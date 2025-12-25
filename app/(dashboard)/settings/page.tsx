"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Bot, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { CitationCard } from "@/components/shared/citation-card";

export default function SettingsPage() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.get("/health"),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings & Help
        </h1>
        <p className="text-muted-foreground">
          System configuration and documentation
        </p>
      </div>

      <div className="space-y-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground">Checking status...</p>
            ) : health ? (
              <>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>Database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(health as { database?: { connected: boolean } }).database?.connected ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <Badge variant="secondary">
                          {(health as { database?: { size_mb: number } }).database?.size_mb} MB
                        </Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <Badge variant="destructive">Not Connected</Badge>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <span>AI Model</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(health as { openai?: { configured: boolean } }).openai?.configured ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <Badge variant="secondary">
                          {(health as { openai?: { model: string } }).openai?.model}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <Badge variant="destructive">Not Configured</Badge>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>API Status</span>
                  </div>
                  <Badge
                    variant={
                      (health as { status: string }).status === "healthy"
                        ? "default"
                        : (health as { status: string }).status === "degraded"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {(health as { status: string }).status}
                  </Badge>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span>Unable to connect to backend API</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Learn about the RPA Assessment data
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>Land Use Categories</h3>
            <ul>
              <li><strong>Cropland (cr):</strong> Agricultural land used for crop production</li>
              <li><strong>Pasture (ps):</strong> Land used for livestock grazing</li>
              <li><strong>Forest (fr):</strong> Forested areas including managed forests</li>
              <li><strong>Urban (ur):</strong> Developed and built-up areas</li>
              <li><strong>Rangeland (rg):</strong> Natural grasslands and shrublands</li>
            </ul>

            <h3>Climate Scenarios</h3>
            <ul>
              <li><strong>RCP 4.5:</strong> Moderate emissions scenario (stabilization)</li>
              <li><strong>RCP 8.5:</strong> High emissions scenario (business as usual)</li>
              <li><strong>SSP 1-5:</strong> Shared Socioeconomic Pathways describing societal development</li>
            </ul>

            <h3>Key Assumptions</h3>
            <ul>
              <li>Projections cover private land only (public lands assumed static)</li>
              <li>Urban development is irreversible (once urban, always urban)</li>
              <li>Based on observed transitions from 2001-2012 NRI data</li>
            </ul>
          </CardContent>
        </Card>

        {/* Citation */}
        <CitationCard />

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              RPA Land Use Analytics is built with Next.js, FastAPI, and DuckDB.
              Data source: USDA Forest Service 2020 RPA Assessment.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Version 1.0.0 | Modern Frontend Redesign
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

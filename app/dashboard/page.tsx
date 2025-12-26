"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  BarChart3,
  Database,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

const features = [
  {
    title: "Natural Language Queries",
    description:
      "Ask questions about land use transitions in plain English. Our AI translates your questions into optimized database queries.",
    icon: MessageSquare,
    href: "/dashboard/chat",
    color: "text-blue-600",
  },
  {
    title: "Interactive Analytics",
    description:
      "Explore pre-built visualizations including choropleth maps, Sankey diagrams, and scenario comparisons.",
    icon: BarChart3,
    href: "/dashboard/analytics",
    color: "text-green-600",
  },
  {
    title: "Data Explorer",
    description:
      "Write custom SQL queries with an intelligent editor, schema browser, and example templates.",
    icon: Database,
    href: "/dashboard/explorer",
    color: "text-purple-600",
  },
  {
    title: "Data Extraction",
    description:
      "Export filtered datasets in multiple formats (CSV, Excel, JSON, Parquet) for your own analysis.",
    icon: Download,
    href: "/dashboard/extraction",
    color: "text-orange-600",
  },
];

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "healthy":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "degraded":
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    default:
      return <XCircle className="h-5 w-5 text-red-600" />;
  }
}

export default function DashboardPage() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.get("/health"),
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="rounded-xl bg-gradient-to-r from-green-800 to-green-600 text-white p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">
          USDA Forest Service RPA Assessment
        </h1>
        <p className="text-lg text-green-100 mb-4">
          AI-powered analytics for county-level land use projections across
          climate scenarios
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white">
            5.4M+ Transition Records
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white">
            3,075 Counties
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white">
            20 Climate Scenarios
          </Badge>
        </div>
      </div>

      {/* System Status */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Checking status...</p>
          ) : health ? (
            <div className="space-y-4">
              {/* Overall Status */}
              <div className="flex items-center gap-2">
                <StatusIcon status={(health as { status: string }).status} />
                <span className="font-medium">
                  {(health as { status: string }).status === "healthy" ? "All Systems Operational" : (health as { status: string }).status}
                </span>
              </div>

              {/* Database & AI Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Database Status Card */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Database className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Database</span>
                      {(health as { database?: { connected: boolean } }).database?.connected ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Disconnected</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(health as { database?: { path: string } }).database?.path?.startsWith("md:")
                        ? "MotherDuck Cloud • 5.4M+ records"
                        : (health as { database?: { message: string } }).database?.message || "Local database"
                      }
                    </p>
                  </div>
                </div>

                {/* AI Status Card */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">AI Model</span>
                      {(health as { llm?: { configured: boolean } }).llm?.configured ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Not Configured</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(health as { llm?: { provider: string } }).llm?.provider || "Unknown"} • {(health as { llm?: { model: string } }).llm?.model || "Not configured"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Unable to connect to backend API</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.href} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {feature.description}
                </CardDescription>
                <Button asChild>
                  <Link href={feature.href}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* About Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>About the 2020 RPA Assessment</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            The Resources Planning Act (RPA) Assessment provides long-term projections
            of land use changes across the United States. This dataset includes:
          </p>
          <ul>
            <li>
              <strong>Land Use Types:</strong> Cropland, Pasture, Forest, Urban, and Rangeland
            </li>
            <li>
              <strong>Climate Scenarios:</strong> RCP 4.5 and RCP 8.5 paired with SSP 1-5
            </li>
            <li>
              <strong>Time Periods:</strong> Projections from 2020 to 2100
            </li>
            <li>
              <strong>Geographic Coverage:</strong> All 3,075 US counties
            </li>
          </ul>
          <p className="text-muted-foreground">
            Data source: USDA Forest Service, 2020 RPA Assessment
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

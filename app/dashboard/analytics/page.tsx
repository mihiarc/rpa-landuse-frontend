"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TreePine,
  Wheat,
  Building2,
  Map,
  Database,
  Clock,
  Layers,
} from "lucide-react";
import {
  useOverview,
  useUrbanizationSources,
  useScenarioComparison,
  useForestTransitions,
  useAgriculturalImpact,
} from "@/lib/hooks/use-analytics";
import { StatsCard } from "@/components/analytics/stats-card";
import { PlotlyChart } from "@/components/analytics/plotly-chart";

export default function AnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useOverview();
  const { data: urbanization, isLoading: urbanLoading } = useUrbanizationSources();
  const { data: scenarios, isLoading: scenariosLoading } = useScenarioComparison();
  const { data: forest, isLoading: forestLoading } = useForestTransitions();
  const { data: agricultural, isLoading: agLoading } = useAgriculturalImpact();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Explore land use transition patterns across the United States
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Counties"
          value={overview?.total_counties || 0}
          description="US counties analyzed"
          icon={Map}
          isLoading={overviewLoading}
        />
        <StatsCard
          title="Transitions"
          value={overview?.total_transitions || 0}
          description="Land use change records"
          icon={Database}
          isLoading={overviewLoading}
        />
        <StatsCard
          title="Scenarios"
          value={overview?.scenarios || 0}
          description="Climate projections"
          icon={Layers}
          isLoading={overviewLoading}
        />
        <StatsCard
          title="Time Periods"
          value={overview?.time_periods || 0}
          description="2012 to 2100"
          icon={Clock}
          isLoading={overviewLoading}
        />
        <StatsCard
          title="Land Use Types"
          value={overview?.land_use_types || 0}
          description="Classification categories"
          icon={TreePine}
          isLoading={overviewLoading}
        />
      </div>

      {/* Tabbed Analytics */}
      <Tabs defaultValue="urbanization" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="urbanization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Urbanization
          </TabsTrigger>
          <TabsTrigger value="forest" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            Forest
          </TabsTrigger>
          <TabsTrigger value="agriculture" className="flex items-center gap-2">
            <Wheat className="h-4 w-4" />
            Agriculture
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Scenarios
          </TabsTrigger>
        </TabsList>

        {/* Urbanization Tab */}
        <TabsContent value="urbanization" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sources of Urban Land</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {urbanLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : urbanization?.data ? (
                  <PlotlyChart
                    data={[
                      {
                        type: "pie",
                        labels: urbanization.data.map((d: { source: string }) => d.source),
                        values: urbanization.data.map((d: { total_acres: number }) => d.total_acres),
                        textinfo: "label+percent",
                        hovertemplate:
                          "<b>%{label}</b><br>%{value:,.0f} acres<br>%{percent}<extra></extra>",
                        marker: {
                          colors: ["#22c55e", "#eab308", "#f97316", "#6b7280"],
                        },
                      },
                    ]}
                    layout={{
                      showlegend: true,
                      legend: { orientation: "h", y: -0.1 },
                    }}
                    className="h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Urban Growth by Source</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {urbanLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : urbanization?.data ? (
                  <PlotlyChart
                    data={[
                      {
                        type: "bar",
                        x: urbanization.data.map((d: { source: string }) => d.source),
                        y: urbanization.data.map((d: { total_acres: number }) => d.total_acres / 1000000),
                        marker: {
                          color: ["#22c55e", "#eab308", "#f97316", "#6b7280"],
                        },
                        hovertemplate:
                          "<b>%{x}</b><br>%{y:.2f}M acres<extra></extra>",
                      },
                    ]}
                    layout={{
                      xaxis: { title: { text: "Source Land Use" } },
                      yaxis: { title: { text: "Acres (Millions)" } },
                    }}
                    className="h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forest Tab */}
        <TabsContent value="forest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forest Loss by State (Top 20)</CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
              {forestLoading ? (
                <Skeleton className="w-full h-full" />
              ) : forest?.data ? (
                <PlotlyChart
                  data={[
                    {
                      type: "bar",
                      x: forest.data.slice(0, 20).map((d: { total_acres: number }) => d.total_acres / 1000000),
                      y: forest.data.slice(0, 20).map((d: { state_name: string }) => d.state_name),
                      orientation: "h",
                      marker: { color: "#22c55e" },
                      hovertemplate:
                        "<b>%{y}</b><br>%{x:.2f}M acres<extra></extra>",
                    },
                  ]}
                  layout={{
                    xaxis: { title: { text: "Acres Lost (Millions)" } },
                    yaxis: { autorange: "reversed" },
                    margin: { l: 120 },
                  }}
                  className="h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agriculture Tab */}
        <TabsContent value="agriculture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agricultural Land Loss by State (Top 20)</CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
              {agLoading ? (
                <Skeleton className="w-full h-full" />
              ) : agricultural?.data ? (
                <PlotlyChart
                  data={[
                    {
                      type: "bar",
                      x: agricultural.data.slice(0, 20).map((d: { loss_acres: number }) => d.loss_acres / 1000000),
                      y: agricultural.data.slice(0, 20).map((d: { state_name: string }) => d.state_name),
                      orientation: "h",
                      marker: { color: "#eab308" },
                      hovertemplate:
                        "<b>%{y}</b><br>%{x:.2f}M acres<extra></extra>",
                    },
                  ]}
                  layout={{
                    xaxis: { title: { text: "Acres Lost (Millions)" } },
                    yaxis: { autorange: "reversed" },
                    margin: { l: 120 },
                  }}
                  className="h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Urban Growth vs Forest Loss by Scenario</CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
              {scenariosLoading ? (
                <Skeleton className="w-full h-full" />
              ) : scenarios?.data ? (
                <PlotlyChart
                  data={[
                    {
                      type: "bar",
                      name: "Urban Growth",
                      x: scenarios.data.map((d: { scenario_name: string }) => d.scenario_name),
                      y: scenarios.data.map((d: { urban_growth: number }) => d.urban_growth / 1000000),
                      marker: { color: "#3b82f6" },
                    },
                    {
                      type: "bar",
                      name: "Forest Loss",
                      x: scenarios.data.map((d: { scenario_name: string }) => d.scenario_name),
                      y: scenarios.data.map((d: { forest_loss: number }) => d.forest_loss / 1000000),
                      marker: { color: "#ef4444" },
                    },
                  ]}
                  layout={{
                    barmode: "group",
                    xaxis: { title: { text: "Scenario" }, tickangle: 45 },
                    yaxis: { title: { text: "Acres (Millions)" } },
                    legend: { orientation: "h", y: 1.1 },
                    margin: { b: 150 },
                  }}
                  className="h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

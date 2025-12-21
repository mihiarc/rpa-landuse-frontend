"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface OverviewData {
  total_counties: number;
  total_transitions: number;
  scenarios: number;
  time_periods: number;
  land_use_types: number;
}

interface UrbanizationSource {
  source: string;
  total_acres: number;
  percentage: number;
}

interface UrbanizationResponse {
  data: UrbanizationSource[];
  summary?: Record<string, unknown>;
}

interface ScenarioComparison {
  scenario_name: string;
  rcp: string;
  ssp: string;
  urban_growth: number;
  forest_loss: number;
}

interface ScenarioResponse {
  data: ScenarioComparison[];
  summary?: Record<string, unknown>;
}

interface ForestTransition {
  state_name: string;
  to_landuse: string;
  total_acres: number;
}

interface ForestResponse {
  data: ForestTransition[];
  summary?: Record<string, unknown>;
}

interface AgriculturalImpact {
  state_name: string;
  from_landuse: string;
  loss_acres: number;
}

interface AgriculturalResponse {
  data: AgriculturalImpact[];
  summary?: Record<string, unknown>;
}

export function useOverview() {
  return useQuery<OverviewData>({
    queryKey: ["analytics", "overview"],
    queryFn: () => apiClient.get<OverviewData>("/analytics/overview"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUrbanizationSources() {
  return useQuery<UrbanizationResponse>({
    queryKey: ["analytics", "urbanization-sources"],
    queryFn: () => apiClient.get<UrbanizationResponse>("/analytics/urbanization-sources"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useScenarioComparison() {
  return useQuery<ScenarioResponse>({
    queryKey: ["analytics", "scenario-comparison"],
    queryFn: () => apiClient.get<ScenarioResponse>("/analytics/scenario-comparison"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useForestTransitions(state?: string) {
  return useQuery<ForestResponse>({
    queryKey: ["analytics", "forest-transitions", state],
    queryFn: () =>
      apiClient.get<ForestResponse>("/analytics/forest-transitions", {
        ...(state && { state }),
      }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAgriculturalImpact() {
  return useQuery<AgriculturalResponse>({
    queryKey: ["analytics", "agricultural-impact"],
    queryFn: () => apiClient.get<AgriculturalResponse>("/analytics/agricultural-impact"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGeographicData(state: string) {
  return useQuery({
    queryKey: ["analytics", "geographic", state],
    queryFn: () =>
      apiClient.get<{
        state: string;
        counties: Array<{ fips: string; name: string; urban_growth: number }>;
        summary: { average_urban_growth: number; county_count: number };
      }>(`/analytics/geographic/${encodeURIComponent(state)}`),
    staleTime: 5 * 60 * 1000,
    enabled: !!state,
  });
}

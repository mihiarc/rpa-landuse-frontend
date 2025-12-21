"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[400px]" />,
});

interface PlotlyChartProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  className?: string;
}

export function PlotlyChart({ data, layout, config, className }: PlotlyChartProps) {
  const defaultLayout: Partial<Plotly.Layout> = {
    autosize: true,
    margin: { t: 40, r: 20, b: 40, l: 60 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: {
      family: "inherit",
      color: "hsl(var(--foreground))",
    },
    xaxis: {
      gridcolor: "hsl(var(--border))",
      zerolinecolor: "hsl(var(--border))",
    },
    yaxis: {
      gridcolor: "hsl(var(--border))",
      zerolinecolor: "hsl(var(--border))",
    },
    ...layout,
  };

  const defaultConfig: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: false,
    ...config,
  };

  return (
    <div className={className}>
      <Plot
        data={data}
        layout={defaultLayout}
        config={defaultConfig}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
      />
    </div>
  );
}

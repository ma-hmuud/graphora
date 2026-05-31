"use client";

import {
  Database,
  Network,
  ScatterChart,
  TrendingUp,
  Minus,
} from "lucide-react";
import { cn } from "@graphora/ui/lib/utils";
import { Skeleton } from "@/components/skeleton";

interface Metric {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

type Stats = {
  totalDatasets: number;
  totalGraphs: number;
  nodesAnalyzed: number;
  edgesAnalyzed: number;
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function StatsCards({
  stats,
  isLoading,
}: {
  stats?: Stats;
  isLoading?: boolean;
}) {
  const metrics: Metric[] = [
    {
      label: "Total Datasets",
      value: stats ? numberFormatter.format(stats.totalDatasets) : "-",
      trend: "Active libraries",
      trendUp: true,
      icon: Database,
    },
    {
      label: "Total Graphs",
      value: stats ? numberFormatter.format(stats.totalGraphs) : "-",
      trend: "Running analyses",
      trendUp: true,
      icon: Network,
    },
    {
      label: "Nodes Analyzed",
      value: stats ? numberFormatter.format(stats.nodesAnalyzed) : "-",
      trend: "Stable",
      trendUp: false,
      icon: ScatterChart,
    },
    {
      label: "Edges Analyzed",
      value: stats ? numberFormatter.format(stats.edgesAnalyzed) : "-",
      trend: "New links",
      trendUp: true,
      icon: TrendingUp,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-[#1E293B] border border-outline-variant p-6 rounded-DEFAULT flex flex-col justify-between hover:border-primary/50 transition-colors group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-label-mono text-label-mono">
              {metric.label}
            </span>
            <metric.icon className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
          </div>
          <div>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <div className="font-headline-lg text-headline-lg text-on-surface mb-1">
                  {metric.value}
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-label-mono",
                    metric.trendUp ? "text-primary" : "text-on-surface-variant",
                  )}
                >
                  {metric.trendUp ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                  <span>{metric.trend}</span>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

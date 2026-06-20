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
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-white dark:bg-[#111420]/80 border border-slate-200 dark:border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 transition-all duration-300 shadow-sm dark:shadow-lg group relative overflow-hidden backdrop-blur-xl"
        >
          {/* Subtle background glow effect on hover */}
          <div className="absolute -left-12 -top-12 h-24 w-24 rounded-full bg-primary-container/5 dark:bg-[#c0c1ff]/5 blur-2xl group-hover:bg-primary-container/10 dark:group-hover:bg-[#c0c1ff]/10 transition-all duration-300" />

          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-wider uppercase">
              {metric.label}
            </span>
            <metric.icon className="w-5 h-5 text-slate-400 dark:text-slate-550 group-hover:text-primary-container dark:group-hover:text-[#c0c1ff] transition-colors duration-300" />
          </div>
          <div className="relative z-10">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
                  {metric.value}
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold",
                    metric.trendUp
                      ? "text-primary-container dark:text-[#c0c1ff]"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  {metric.trendUp ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
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

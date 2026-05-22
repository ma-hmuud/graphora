"use client";

import { 
  Database, 
  Network, 
  ScatterChart, 
  TrendingUp, 
  Minus 
} from "lucide-react";
import { cn } from "@graphora/ui/lib/utils";

interface Metric {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: any;
}

const metrics: Metric[] = [
  {
    label: "Total Datasets",
    value: "1,248",
    trend: "+12% this week",
    trendUp: true,
    icon: Database,
  },
  {
    label: "Total Graphs",
    value: "342",
    trend: "+5% this week",
    trendUp: true,
    icon: Network,
  },
  {
    label: "Nodes Analyzed",
    value: "8.4M",
    trend: "Stable",
    trendUp: false,
    icon: ScatterChart,
  },
  {
    label: "Edges Analyzed",
    value: "14.2M",
    trend: "+22% this week",
    trendUp: true,
    icon: TrendingUp,
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
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
            <div className="font-headline-lg text-headline-lg text-on-surface mb-1">
              {metric.value}
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-label-mono",
                metric.trendUp ? "text-primary" : "text-on-surface-variant"
              )}
            >
              {metric.trendUp ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span>{metric.trend}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

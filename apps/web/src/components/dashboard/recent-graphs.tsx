"use client";

import { Network, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@graphora/ui/lib/utils";
import { useDashboardData } from "@/hooks/dashboard/use-dashboard-data";
import { Skeleton } from "@/components/skeleton";
import type { Graph } from "@/lib/types";
import Link from "next/link";

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function RecentGraphs() {
  const { graphs, isLoading } = useDashboardData();

  return (
    <div className="bg-white dark:bg-[#111420]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col backdrop-blur-xl shadow-sm dark:shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Recent Graphs
        </h3>
        <Link
          href="/dashboard/graphs"
          className="text-xs text-primary-container dark:text-[#c0c1ff] hover:text-[#6c6fed] dark:hover:text-primary-fixed font-semibold uppercase tracking-wider transition-colors"
        >
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-slate-50/50 dark:bg-black/20 p-4 border border-slate-200 dark:border-white/5 rounded-xl flex items-center gap-4 animate-pulse"
              >
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (graphs ?? []).length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm italic py-4">
            No graphs yet.
          </p>
        ) : (
          (graphs ?? []).slice(0, 4).map((graph: Graph) => (
            <Link
              href={`/dashboard/graphs/${graph.id}`}
              key={graph.id}
              className={cn(
                "bg-slate-50/50 dark:bg-black/20 p-4 border transition-all duration-300 rounded-xl flex justify-between items-center group cursor-pointer",
                graph.status === "READY" &&
                  "border-slate-100 dark:border-white/5 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-100 dark:hover:bg-black/30",
                graph.status === "PROCESSING" &&
                  "border-primary-container/30 dark:border-[#c0c1ff]/30 shadow-[0_0_12px_rgba(128,131,255,0.15)] dark:shadow-[0_0_12px_rgba(192,193,255,0.15)]",
                graph.status === "FAILED" &&
                  "border-slate-100 dark:border-white/5 hover:border-red-500/30",
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg border flex items-center justify-center relative shrink-0",
                    graph.status === "READY" &&
                      "bg-primary-container/10 dark:bg-[#c0c1ff]/10 border-primary-container/20 dark:border-[#c0c1ff]/20 text-primary-container dark:text-[#c0c1ff]",
                    graph.status === "PROCESSING" &&
                      "bg-primary-container/10 border-primary-container/20 text-primary-container",
                    graph.status === "FAILED" &&
                      "bg-red-500/10 border-red-500/20 text-red-400",
                  )}
                >
                  {graph.status === "PROCESSING" ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping opacity-75" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                    </>
                  ) : graph.status === "FAILED" ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Network className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-container dark:group-hover:text-[#c0c1ff] transition-colors duration-300 text-sm">
                    {graph.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {graph.status === "READY"
                      ? `${numberFormatter.format(graph.nodeCount ?? 0)} Nodes • ${numberFormatter.format(graph.edgeCount ?? 0)} Edges`
                      : graph.status === "FAILED"
                        ? "Processing Failed"
                        : "Processing..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {graph.status === "READY" && (
                  <span className="px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-[9px] uppercase font-semibold tracking-wider">
                    Ready
                  </span>
                )}
                {graph.status === "PROCESSING" && (
                  <span className="px-2 py-0.5 rounded border border-amber-500/20 text-amber-650 dark:text-amber-400 bg-amber-500/5 text-[9px] uppercase font-semibold tracking-wider flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    Running
                  </span>
                )}
                {graph.status === "FAILED" && (
                  <span className="px-2 py-0.5 rounded border border-red-500/20 text-red-500 dark:text-red-400 bg-red-500/5 text-[9px] uppercase font-semibold tracking-wider">
                    Failed
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

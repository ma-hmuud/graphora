"use client";

import { Network, RefreshCw, AlertCircle, MoreVertical } from "lucide-react";
import { cn } from "@graphora/ui/lib/utils";
import { useDashboardData } from "@/hooks/dashboard/use-dashboard-data";
import { Skeleton } from "@/components/skeleton";
import Link from "next/link";

type GraphStatus = "READY" | "PROCESSING" | "FAILED";

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function RecentGraphs() {
  const { graphs, isLoading } = useDashboardData();

  return (
    <div className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-headline-md text-on-surface">
          Recent Graphs
        </h3>
        <Link
          href="/dashboard/graphs"
          className="text-primary hover:text-primary-fixed-dim font-label-mono text-label-mono underline underline-offset-4"
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
                className="bg-surface-container p-4 border border-outline-variant/40 rounded-DEFAULT flex items-center gap-4"
              >
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (graphs ?? []).length === 0 ? (
          <p className="text-on-surface-variant">No graphs yet.</p>
        ) : (
          (graphs ?? []).map((graph: any) => (
            <div
              key={graph.id}
              className={cn(
                "bg-surface-container p-4 border transition-colors rounded-DEFAULT flex justify-between items-center group cursor-pointer",
                graph.status === "READY" &&
                  "border-outline-variant hover:border-primary/40",
                graph.status === "PROCESSING" &&
                  "border-primary/50 shadow-[0_0_8px_rgba(192,193,255,0.15)]",
                graph.status === "FAILED" &&
                  "border-outline-variant hover:border-error/40",
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded border flex items-center justify-center relative",
                    graph.status === "READY" &&
                      "bg-primary/10 border-primary/30 text-primary",
                    graph.status === "PROCESSING" &&
                      "bg-primary/10 border-primary/30 text-primary",
                    graph.status === "FAILED" &&
                      "bg-error/10 border-error/30 text-error",
                  )}
                >
                  {graph.status === "PROCESSING" ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f39c12] rounded-full animate-ping opacity-75" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f39c12] rounded-full" />
                    </>
                  ) : graph.status === "FAILED" ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Network className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4
                    className={cn(
                      "font-headline-sm text-headline-sm text-on-surface transition-colors",
                      graph.status === "READY" && "group-hover:text-primary",
                    )}
                  >
                    {graph.name}
                  </h4>
                  <p
                    className={cn(
                      "font-label-mono text-label-mono",
                      graph.status === "FAILED"
                        ? "text-error/80"
                        : "text-on-surface-variant",
                    )}
                  >
                    {graph.status === "READY"
                      ? `${numberFormatter.format(
                          graph.nodeCount ?? 0,
                        )} Nodes • ${numberFormatter.format(
                          graph.edgeCount ?? 0,
                        )} Edges`
                      : "Processing..."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {graph.status === "READY" && (
                  <span className="px-2 py-1 rounded-sm border border-[#2ecc71] text-[#2ecc71] bg-[#2ecc71]/10 font-label-mono text-[10px] uppercase tracking-wider">
                    Ready
                  </span>
                )}
                {graph.status === "PROCESSING" && (
                  <span className="px-2 py-1 rounded-sm border border-[#f39c12] text-[#f39c12] bg-[#f39c12]/10 font-label-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Processing
                  </span>
                )}
                {graph.status === "FAILED" && (
                  <span className="px-2 py-1 rounded-sm border border-error text-error bg-error/10 font-label-mono text-[10px] uppercase tracking-wider">
                    Failed
                  </span>
                )}
                <button className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

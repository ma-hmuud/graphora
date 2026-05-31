"use client";

import Link from "next/link";
import { Database } from "lucide-react";
import { useDashboardData } from "@/hooks/dashboard/use-dashboard-data";
import { Skeleton } from "@/components/skeleton";
import type { Dataset } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function RecentDatasets() {
  const { datasets, isLoading } = useDashboardData();

  return (
    <div className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Recent Datasets
          </h3>
        </div>
        <Link
          href="/dashboard/datasets"
          className="text-primary hover:text-primary-fixed-dim font-label-mono text-label-mono underline underline-offset-4"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`dataset-skeleton-${index}`}
              className="flex items-center gap-4 border border-outline-variant/40 rounded-DEFAULT p-4"
            >
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (datasets ?? []).length === 0 ? (
        <p className="text-on-surface-variant">No datasets yet.</p>
      ) : (
        <div className="space-y-3">
          {(datasets ?? []).slice(0, 5).map((dataset: Dataset) => (
            <Link
              key={dataset.id}
              href={`/dashboard/datasets/${dataset.id}`}
              className="bg-surface-container p-4 border border-outline-variant/60 rounded-DEFAULT flex justify-between items-center hover:border-primary/40 transition-colors"
            >
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">
                  {dataset.name}
                </h4>
                <p className="text-on-surface-variant font-label-mono text-label-mono">
                  {dataset.rowCount
                    ? numberFormatter.format(dataset.rowCount)
                    : "-"}{" "}
                  rows
                </p>
              </div>
              <span className="text-on-surface-variant font-label-mono text-label-mono">
                {dataset.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

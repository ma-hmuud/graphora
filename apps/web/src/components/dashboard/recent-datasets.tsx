"use client";

import Link from "next/link";
import { Database } from "lucide-react";
import { useDashboardData } from "@/hooks/dashboard/use-dashboard-data";
import { Skeleton } from "@/components/skeleton";
import type { Dataset } from "@/lib/types";

export function RecentDatasets() {
  const { datasets, isLoading } = useDashboardData();

  return (
    <div className="bg-white dark:bg-[#111420]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col backdrop-blur-xl shadow-sm dark:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-primary-container dark:text-[#c0c1ff]" />
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Recent Datasets
          </h3>
        </div>
        <Link
          href="/dashboard/datasets"
          className="text-xs text-primary-container dark:text-[#c0c1ff] hover:text-[#6c6fed] dark:hover:text-primary-fixed font-semibold uppercase tracking-wider transition-colors"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`dataset-skeleton-${index}`}
              className="flex items-center gap-4 border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl animate-pulse"
            >
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (datasets ?? []).length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm italic py-4">
          No datasets yet.
        </p>
      ) : (
        <div className="space-y-3">
          {(datasets ?? []).slice(0, 4).map((dataset: Dataset) => (
            <Link
              key={dataset.id}
              href={`/dashboard/datasets/${dataset.id}`}
              className="bg-slate-50/50 dark:bg-black/20 p-4 border border-slate-100 dark:border-white/5 rounded-xl flex justify-between items-center hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-100 dark:hover:bg-black/30 transition-all duration-300 group"
            >
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-container dark:group-hover:text-[#c0c1ff] transition-colors duration-300 text-sm">
                  {dataset.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm truncate">
                  {dataset.description ?? "No description provided."}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 text-[9px] font-mono">
                {dataset.sizeBytes
                  ? `${(dataset.sizeBytes / 1024).toFixed(1)} KB`
                  : "-"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

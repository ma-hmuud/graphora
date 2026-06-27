"use client";

import { Database, UploadCloud } from "lucide-react";
import { useDashboardData } from "@/hooks/dashboard/use-dashboard-data";
import { Skeleton } from "@/components/skeleton";
import DropdownMenuActions from "@graphora/ui/components/dropdown-menu-actions-2";
import type { Dataset, Graph } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function DatasetInventory() {
  const { datasets, graphs, isLoading } = useDashboardData();
  const graphByDatasetId = new Map(
    (graphs ?? []).map((graph: Graph) => [graph.dataset.id, graph]),
  );

  return (
    <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Dataset Inventory
            </h3>
            <p className="text-on-surface-variant font-body-md text-body-md">
              CSV uploads with density and PageRank previews.
            </p>
          </div>
        </div>
        <button className="bg-primary hover:bg-primary-fixed text-on-primary px-4 py-2 rounded-DEFAULT font-label-mono text-label-mono flex items-center gap-2">
          <UploadCloud className="w-4 h-4" />
          Upload CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`dataset-skeleton-${index}`}
                className="flex items-center gap-4 border border-outline-variant/40 rounded-DEFAULT p-4"
              >
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-on-surface-variant font-label-mono text-label-mono">
                <th className="py-3 pr-4 border-b border-outline-variant">
                  Dataset
                </th>
                <th className="py-3 pr-4 border-b border-outline-variant">
                  Rows
                </th>
                <th className="py-3 pr-4 border-b border-outline-variant">
                  Nodes
                </th>
                <th className="py-3 pr-4 border-b border-outline-variant">
                  Edges
                </th>
                <th className="py-3 pr-4 border-b border-outline-variant">
                  Density
                </th>
                <th className="py-3 pr-4 border-b border-outline-variant">
                  PageRank Top
                </th>
                <th className="py-3 pr-4 border-b border-outline-variant">
                  Updated
                </th>
                <th className="py-3 pr-4 border-b border-outline-variant w-10">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {(datasets ?? []).map((dataset: Dataset) => {
                const graph = graphByDatasetId.get(dataset.id);
                const densityPercent = graph?.density
                  ? Math.round(graph.density * 100)
                  : null;

                return (
                  <tr
                    key={dataset.id}
                    className="border-b border-outline-variant/40 hover:bg-surface-container-highest/30 transition-colors"
                  >
                    <td className="py-4 pr-4 text-on-surface font-body-md text-body-md">
                      {dataset.name}
                    </td>
                    <td className="py-4 pr-4 text-on-surface-variant font-label-mono text-label-mono">
                      {dataset.rowCount
                        ? numberFormatter.format(dataset.rowCount)
                        : "-"}
                    </td>
                    <td className="py-4 pr-4 text-on-surface-variant font-label-mono text-label-mono">
                      {graph?.nodeCount
                        ? numberFormatter.format(graph.nodeCount)
                        : "-"}
                    </td>
                    <td className="py-4 pr-4 text-on-surface-variant font-label-mono text-label-mono">
                      {graph?.edgeCount
                        ? numberFormatter.format(graph.edgeCount)
                        : "-"}
                    </td>
                    <td className="py-4 pr-4">
                      {densityPercent !== null ? (
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 rounded-full bg-outline-variant/40 overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${densityPercent}%` }}
                            />
                          </div>
                          <span className="text-on-surface-variant font-label-mono text-xs">
                            {densityPercent}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant font-label-mono text-xs">
                          -
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-on-surface-variant font-label-mono text-xs">
                      {graph?.shareSlug ? graph.shareSlug : "-"}
                    </td>
                    <td className="py-4 pr-4 text-on-surface-variant font-label-mono text-xs">
                      {new Date(dataset.updatedAt).toLocaleString()}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <DropdownMenuActions />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ExternalLink, Folder, Star } from "lucide-react";
import { useGraphs } from "@/hooks/graphs/use-graphs";

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function WorkspaceGrid() {
  const { data: graphs, isLoading } = useGraphs();

  return (
    <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Graph Workspace
            </h3>
            <p className="text-on-surface-variant font-body-md text-body-md">
              Saved graph projects with previews.
            </p>
          </div>
        </div>
        <button className="text-primary hover:text-primary-fixed-dim font-label-mono text-label-mono underline underline-offset-4">
          View all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-on-surface-variant">Loading workspaces...</p>
        ) : (graphs ?? []).length === 0 ? (
          <p className="text-on-surface-variant">No graph workspaces yet.</p>
        ) : (
          (graphs ?? []).map((graph) => (
            <Link
              key={graph.id}
              href={`/dashboard/graphs/${graph.id}`}
              className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4 hover:border-primary/40 transition-colors group"
            >
              <div className="h-32 rounded bg-linear-to-br from-primary/20 via-surface-container-high to-surface-container-low border border-outline-variant/40 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.08),transparent_50%)]" />
                <div className="absolute inset-0 opacity-70" />
                <div className="absolute top-3 right-3 bg-surface-container-highest/70 border border-outline-variant/40 rounded-full px-2 py-1 text-[10px] text-on-surface-variant font-label-mono flex items-center gap-1">
                  <Star className="w-3 h-3 text-primary" />
                  {graph.nodeCount
                    ? numberFormatter.format(graph.nodeCount)
                    : "-"}{" "}
                  nodes
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {graph.name}
                  </h4>
                  <p className="text-on-surface-variant font-label-mono text-label-mono">
                    {graph.nodeCount
                      ? numberFormatter.format(graph.nodeCount)
                      : "-"}{" "}
                    nodes ·{" "}
                    {graph.edgeCount
                      ? numberFormatter.format(graph.edgeCount)
                      : "-"}{" "}
                    edges
                  </p>
                  <p className="text-on-surface-variant text-xs mt-2">
                    Dataset: {graph.dataset.name}
                  </p>
                </div>
                <div className="text-on-surface-variant group-hover:text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

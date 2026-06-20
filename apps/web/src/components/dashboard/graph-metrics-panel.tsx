"use client";

import { useMemo } from "react";
import type { Graph } from "@/lib/types";

export type MetricKey = 
  | "pagerank"
  | "degreeCentrality"
  | "betweennessCentrality"
  | "closenessCentrality"
  | "eigenvectorCentrality";

type NodeMetrics = {
  pagerank: number;
  degreeCentrality?: number;
  betweennessCentrality?: number;
  closenessCentrality?: number;
  eigenvectorCentrality?: number;
};


type GraphNode = {
  id: string;
  x?: number;
  y?: number;
  community?: number;
  metrics?: NodeMetrics;
};

type GraphLink = {
  source: string;
  target: string;
  weight?: number;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

const metricLabels: Record<MetricKey, string> = {
  pagerank: "PageRank",
  degreeCentrality: "Degree Centrality",
  betweennessCentrality: "Betweenness Centrality",
  closenessCentrality: "Closeness Centrality",
  eigenvectorCentrality: "Eigenvector Centrality",
};



export function GraphMetricsPanel({
  graph,
  metric,
  scale,
  minSize,
  maxSize,
  showTooltips,
  showSidePanel,
  colorRamp,
  onMetricChange,
  onScaleChange,
  onMinSizeChange,
  onMaxSizeChange,
  onToggleTooltips,
  onToggleSidePanel,
  onColorRampChange,
  onFullscreen,
}: {
  graph: Graph;
  metric: MetricKey;
  scale: "linear" | "log";
  minSize: number;
  maxSize: number;
  showTooltips: boolean;
  showSidePanel: boolean;
  colorRamp: "indigo" | "cyan" | "ember";
  onMetricChange: (value: MetricKey) => void;
  onScaleChange: (value: "linear" | "log") => void;
  onMinSizeChange: (value: number) => void;
  onMaxSizeChange: (value: number) => void;
  onToggleTooltips: () => void;
  onToggleSidePanel: () => void;
  onColorRampChange: (value: "indigo" | "cyan" | "ember") => void;
  onFullscreen: () => void;
}) {
  const graphData = graph.graphData as GraphData | undefined;
  const summary = useMemo(() => {
    if (!graphData) return { nodeCount: 0, linkCount: 0 };
    return { nodeCount: graphData.nodes.length, linkCount: graphData.links.length };
  }, [graphData]);

  return (
    <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              Metric
            </label>
            <select
              value={metric}
              onChange={(event) => onMetricChange(event.target.value as MetricKey)}
              className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT text-sm text-on-surface px-3 py-2"
            >
              {Object.entries(metricLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              Scale
            </label>
            <select
              value={scale}
              onChange={(event) =>
                onScaleChange(event.target.value as "linear" | "log")
              }
              className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT text-sm text-on-surface px-3 py-2"
            >
              <option value="linear">Linear</option>
              <option value="log">Log</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              Size
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={minSize}
              onChange={(event) => onMinSizeChange(Number(event.target.value))}
              className="w-16 bg-[#0B0F19] border border-outline-variant rounded-DEFAULT text-sm text-on-surface px-2 py-2"
            />
            <span className="text-on-surface-variant">→</span>
            <input
              type="number"
              min={4}
              max={30}
              value={maxSize}
              onChange={(event) => onMaxSizeChange(Number(event.target.value))}
              className="w-16 bg-[#0B0F19] border border-outline-variant rounded-DEFAULT text-sm text-on-surface px-2 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              Colors
            </label>
            <select
              value={colorRamp}
              onChange={(event) =>
                onColorRampChange(event.target.value as "indigo" | "cyan" | "ember")
              }
              className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT text-sm text-on-surface px-3 py-2"
            >
              <option value="indigo">Indigo</option>
              <option value="cyan">Cyan</option>
              <option value="ember">Ember</option>
            </select>
          </div>
          <button
            onClick={onToggleTooltips}
            className={`px-3 py-2 rounded-DEFAULT text-sm border ${
              showTooltips
                ? "border-primary text-primary"
                : "border-outline-variant text-on-surface-variant"
            }`}
          >
            Tooltips
          </button>
          <button
            onClick={onToggleSidePanel}
            className={`px-3 py-2 rounded-DEFAULT text-sm border ${
              showSidePanel
                ? "border-primary text-primary"
                : "border-outline-variant text-on-surface-variant"
            }`}
          >
            Side panel
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-on-surface-variant text-sm">
            {summary.nodeCount} nodes · {summary.linkCount} edges
          </span>
          <button
            onClick={onFullscreen}
            className="px-4 py-2 rounded-DEFAULT bg-inverse-primary hover:bg-primary-container text-white text-sm"
          >
            Fullscreen
          </button>
        </div>
      </div>
    </section>
  );
}

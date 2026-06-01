"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useGraph } from "@/hooks/graphs/use-graph";
import { Skeleton } from "@/components/skeleton";
import dynamic from "next/dynamic";
import type { Graph } from "@/lib/types";
import { apolloClient } from "@/lib/apollo-client";
import {
  DELETE_GRAPH_MUTATION,
  REGENERATE_GRAPH_MUTATION,
} from "@/lib/graphql/mutations";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCcw, Search, Trash2, X } from "lucide-react";
import type {
  GraphData,
  MetricKey,
} from "@/components/dashboard/graph-metrics-panel";
import { DeleteModal } from "@/components/dashboard/delete-modal";

export default function GraphDetailPage() {
  const params = useParams<{ id: string }>();
  const graphId = Number(params.id);
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: graph, isLoading } = useGraph(graphId);
  const queryClient = useQueryClient();
  const [metric, setMetric] = useState<MetricKey>("degree");
  const [scale, setScale] = useState<"linear" | "log">("linear");
  const [minSize, setMinSize] = useState(3);
  const [maxSize, setMaxSize] = useState(12);
  const [showTooltips] = useState(true);
  const [colorRamp, setColorRamp] = useState<"indigo" | "cyan" | "ember">(
    "indigo",
  );
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const router = useRouter();

  const ForceGraph2D = dynamic(
    () => import("react-force-graph-2d").then((mod) => mod.default),
    { ssr: false },
  );

  if (isAuthPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session?.user) {
    return redirect("/login");
  }

  if (!session.user.emailVerified) {
    return redirect("/verify-email");
  }

  const handleDeleteGraph = async () => {
    if (!graph) return;
    await apolloClient.mutate({
      mutation: DELETE_GRAPH_MUTATION,
      variables: { id: graph.id },
    });
  };

  const handleRegenerateGraph = async () => {
    if (!graph) return;
    try {
      await apolloClient.mutate({
        mutation: REGENERATE_GRAPH_MUTATION,
        variables: { id: graph.id },
      });
      toast("Graph reprocessing started.");
      queryClient.invalidateQueries({ queryKey: ["graphs", graph.id] });
      queryClient.invalidateQueries({ queryKey: ["graphs"] });
    } catch (error) {
      toast("Failed to regenerate graph.");
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <main className="grow transition-[margin] duration-300">
        <div className="max-w-6xl mx-auto space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={`graph-detail-${index}`} className="h-20" />
                ))}
              </div>
            </div>
          ) : !graph ? (
            <p className="text-on-surface-variant">Graph not found.</p>
          ) : (
            <>
              <header>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                  {graph.name}
                </h2>
                <p className="text-on-surface-variant font-body-md text-body-md">
                  Dataset: {graph.dataset.name}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleRegenerateGraph}
                    className="border border-outline-variant hover:border-primary text-primary px-4 py-2 rounded-DEFAULT font-label-mono text-label-mono flex items-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Regenerate graph
                  </button>
                  <button
                    onClick={() => setIsDeleteOpen(true)}
                    className="border border-error/40 hover:border-error text-error px-4 py-2 rounded-DEFAULT font-label-mono text-label-mono flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete graph
                  </button>
                </div>
              </header>

              <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Graph stats
                    </h3>
                    <p className="text-on-surface-variant text-sm">
                      Metrics snapshot for this graph.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="px-4 py-2 rounded-DEFAULT bg-inverse-primary hover:bg-primary-container text-white text-sm"
                  >
                    View graph
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                    <p className="text-on-surface-variant text-xs">Status</p>
                    <p className="text-on-surface font-label-mono text-label-mono">
                      {graph.status}
                    </p>
                  </div>
                  <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                    <p className="text-on-surface-variant text-xs">Nodes</p>
                    <p className="text-on-surface font-label-mono text-label-mono">
                      {graph.nodeCount ?? "-"}
                    </p>
                  </div>
                  <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                    <p className="text-on-surface-variant text-xs">Edges</p>
                    <p className="text-on-surface font-label-mono text-label-mono">
                      {graph.edgeCount ?? "-"}
                    </p>
                  </div>
                  <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                    <p className="text-on-surface-variant text-xs">Density</p>
                    <p className="text-on-surface font-label-mono text-label-mono">
                      {graph.density ?? "-"}
                    </p>
                  </div>
                  <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                    <p className="text-on-surface-variant text-xs">
                      Components
                    </p>
                    <p className="text-on-surface font-label-mono text-label-mono">
                      {graph.componentsCount ?? "-"}
                    </p>
                  </div>
                </div>
                <NodeHoverHint />
              </section>
            </>
          )}
        </div>
        <DeleteModal
          isOpen={isDeleteOpen}
          t={graph ? { id: graph.id, name: graph.name } : undefined}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={() => {
            queryClient.invalidateQueries({ queryKey: ["graphs"] });
            router.push("/dashboard/graphs");
          }}
          deleteT={handleDeleteGraph}
        />
      </main>
      {(graph?.graphData as GraphData) && isFullscreen && (
        <FullscreenGraph
          graph={graph!}
          ForceGraph2D={ForceGraph2D as any}
          metric={metric}
          scale={scale}
          minSize={minSize}
          maxSize={maxSize}
          showTooltips={showTooltips}
          colorRamp={colorRamp}
          onClose={() => setIsFullscreen(false)}
          onNodeSelect={(id) => setHighlightNodeId(id)}
          onMetricChange={setMetric}
          onScaleChange={setScale}
          onMinSizeChange={setMinSize}
          onMaxSizeChange={setMaxSize}
          onColorRampChange={setColorRamp}
          highlightNodeId={highlightNodeId}
        />
      )}
    </div>
  );
}

function GraphCanvas({
  graph,
  ForceGraph2D,
  metric,
  scale,
  minSize,
  maxSize,
  showTooltips,
  colorRamp,
  highlightNodeId,
  graphRef,
}: {
  graph: Graph;
  ForceGraph2D: typeof import("react-force-graph-2d").default;
  metric: MetricKey;
  scale: "linear" | "log";
  minSize: number;
  maxSize: number;
  showTooltips: boolean;
  colorRamp: "indigo" | "cyan" | "ember";
  highlightNodeId?: string | null;
  graphRef?: React.MutableRefObject<any> | null;
}) {
  const rawGraphData = graph.graphData as GraphData | undefined;
  const internalRef = useRef<any>(null);
  const fgRef = graphRef ?? internalRef;

  if (!rawGraphData) {
    return <p className="text-on-surface-variant">Graph data unavailable.</p>;
  }

  const graphData = useMemo(
    () => ({
      nodes: rawGraphData.nodes.map((node) => ({ ...node })),
      links: rawGraphData.links.map((link) => ({ ...link })),
    }),
    [rawGraphData],
  );

  const { min, max } = useMemo(() => {
    const values = rawGraphData.nodes
      .map((node) => node.metrics?.[metric] ?? 0)
      .filter((value) => Number.isFinite(value));
    return {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 1,
    };
  }, [rawGraphData.nodes, metric]);

  const normalize = (value: number) => {
    const safeMin = min;
    const safeMax = max === min ? min + 1 : max;
    const normalized = (value - safeMin) / (safeMax - safeMin);
    return Math.min(1, Math.max(0, normalized));
  };

  const scaleValue = (value: number) => {
    if (scale === "log") {
      return Math.log10(value + 1) / Math.log10(max + 1 || 2);
    }
    return normalize(value);
  };

  const sizeForNode = (node: any) => {
    const value = node.metrics?.[metric] ?? 0;
    const scaled = scaleValue(value);
    const size = minSize + (maxSize - minSize) * scaled;
    return highlightNodeId && node.id === highlightNodeId ? size + 2 : size;
  };

  const colorForNode = (node: any) => {
    if (highlightNodeId && node.id === highlightNodeId) {
      return "rgba(248, 250, 252, 0.95)";
    }
    const value = node.metrics?.[metric] ?? 0;
    const scaled = scaleValue(value);
    const palette = {
      indigo: [99, 102, 241],
      cyan: [34, 211, 238],
      ember: [251, 146, 60],
    }[colorRamp];
    const shade = 0.25 + scaled * 0.75;
    return `rgba(${palette[0]}, ${palette[1]}, ${palette[2]}, ${shade})`;
  };

  const shouldCanvasMode = rawGraphData.nodes.length > 2000;

  return (
    <div className="h-[480px] w-full">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeRelSize={4}
        nodeVal={sizeForNode}
        nodeColor={colorForNode}
        linkColor={() => "rgba(99, 102, 241, 0.35)"}
        onNodeClick={() => undefined}
        onNodeHover={() => undefined}
        nodeLabel={showTooltips ? (node: any) => nodeTooltip(node) : undefined}
        warmupTicks={shouldCanvasMode ? 10 : 0}
        cooldownTicks={shouldCanvasMode ? 20 : 0}
        enableNodeDrag={!shouldCanvasMode}
        nodeCanvasObjectMode={shouldCanvasMode ? () => "replace" : undefined}
        nodeCanvasObject={
          shouldCanvasMode
            ? (node: any, ctx: CanvasRenderingContext2D) => {
                const size = sizeForNode(node);
                ctx.beginPath();
                ctx.fillStyle = colorForNode(node);
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                ctx.fill();
              }
            : undefined
        }
      />
    </div>
  );
}

function NodeHoverHint() {
  return (
    <div className="border-t border-outline-variant/50 pt-4 mt-6">
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
        Node details
      </h3>
      <p className="text-on-surface-variant">
        Hover a node in fullscreen to see metrics.
      </p>
    </div>
  );
}

function nodeTooltip(node: any) {
  const metrics = node?.metrics || {};
  return `${node.id}\nDegree: ${metrics.degree?.toFixed?.(4) ?? "-"}\nBetweenness: ${metrics.betweenness?.toFixed?.(4) ?? "-"}\nCloseness: ${metrics.closeness?.toFixed?.(4) ?? "-"}\nPageRank: ${metrics.pagerank?.toFixed?.(4) ?? "-"}`;
}

function FullscreenGraph({
  graph,
  ForceGraph2D,
  metric,
  scale,
  minSize,
  maxSize,
  showTooltips,
  colorRamp,
  onClose,
  onNodeSelect,
  onMetricChange,
  onScaleChange,
  onMinSizeChange,
  onMaxSizeChange,
  onColorRampChange,
  highlightNodeId,
}: {
  graph: Graph;
  ForceGraph2D: typeof import("react-force-graph-2d").default;
  metric: MetricKey;
  scale: "linear" | "log";
  minSize: number;
  maxSize: number;
  showTooltips: boolean;
  colorRamp: "indigo" | "cyan" | "ember";
  onClose: () => void;
  onNodeSelect: (id: string | null) => void;
  onMetricChange: (value: MetricKey) => void;
  onScaleChange: (value: "linear" | "log") => void;
  onMinSizeChange: (value: number) => void;
  onMaxSizeChange: (value: number) => void;
  onColorRampChange: (value: "indigo" | "cyan" | "ember") => void;
  highlightNodeId: string | null;
}) {
  const [query, setQuery] = useState("");
  const graphRef = useRef<any>(null);
  const graphData = graph.graphData as GraphData | undefined;

  const handleSearch = () => {
    if (!graphData) return;
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;

    const node = graphData.nodes.find((item) =>
      item.id.toLowerCase().includes(normalized),
    );
    if (!node) return;

    onNodeSelect(node.id);

    // Access live positions via the simulation nodes
    const simulation = graphRef.current?.d3Force("link");
    const liveNodes = simulation?.links?.() ?? null;

    // Fallback: just use node.x/y directly — they mutate in place
    const x = (node as any).x;
    const y = (node as any).y;

    if (x === undefined || y === undefined) return;

    graphRef.current?.centerAt(x, y, 600);
    graphRef.current?.zoom(6, 600);
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#0B0F19]/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
        <div className="text-on-surface font-headline-sm text-headline-sm">
          {graph.name}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0B0F19] border border-outline-variant rounded-DEFAULT px-3 py-2">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find node name"
              className="bg-transparent text-on-surface text-sm focus:outline-none w-40"
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-2 rounded-DEFAULT border border-outline-variant text-on-surface-variant text-sm"
          >
            Focus
          </button>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="px-6 py-3 border-b border-outline-variant flex flex-wrap items-center gap-3">
        <select
          value={metric}
          onChange={(event) => onMetricChange(event.target.value as MetricKey)}
          className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT text-sm text-on-surface px-3 py-2"
        >
          <option value="degree">Degree</option>
          <option value="betweenness">Betweenness</option>
          <option value="closeness">Closeness</option>
          <option value="pagerank">PageRank</option>
        </select>
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
        <div className="flex items-center gap-2">
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
        {highlightNodeId && (
          <span className="text-on-surface-variant text-xs">
            Focused: {highlightNodeId}
          </span>
        )}
      </div>
      <div className="p-6 h-[calc(100vh-64px)]">
        <GraphCanvas
          graph={graph}
          ForceGraph2D={ForceGraph2D}
          metric={metric}
          scale={scale}
          minSize={minSize}
          maxSize={maxSize}
          showTooltips={showTooltips}
          colorRamp={colorRamp}
          highlightNodeId={highlightNodeId}
          graphRef={graphRef}
        />
      </div>
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState, useEffect } from "react";
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
import { Bookmark, RefreshCcw, Search, Trash2, X } from "lucide-react";
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

  useEffect(() => {
    if (!isAuthPending && !session?.user) {
      router.push("/login");
    } else if (!isAuthPending && session?.user && !session.user.emailVerified) {
      router.push("/verify-email");
    }
  }, [session, isAuthPending, router]);

  if (isAuthPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session?.user || !session.user.emailVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading...
      </div>
    );
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const graphData = graph.graphData as GraphData | undefined;
  const [hiddenCommunities, setHiddenCommunities] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const COMMUNITY_COLORS = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#6366F1",
    "#EC4899",
    "#8B5CF6",
    "#14B8A6",
    "#F97316",
    "#06B6D4",
    "#84CC16",
    "#D946EF",
    "#F43F5E",
    "#0EA5E9",
    "#10B981",
    "#EAB308",
  ];

  const getColor = (community: number = 0) => {
    return COMMUNITY_COLORS[community % COMMUNITY_COLORS.length];
  };

  const communities = useMemo(() => {
    if (!graphData) return [];
    const counts: Record<number, number> = {};
    graphData.nodes.forEach((n) => {
      const c = n.community ?? 0;
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([id, count]) => ({ id: Number(id), count }))
      .sort((a, b) => b.count - a.count);
  }, [graphData]);

  const filteredGraphData = useMemo(() => {
    if (!graphData) return { nodes: [], links: [] };
    const nodes = graphData.nodes
      .filter((n) => !hiddenCommunities.has(n.community ?? 0))
      .map((n) => ({ ...n }));
    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = graphData.links
      .filter((l) => nodeIds.has(l.source as string) && nodeIds.has(l.target as string))
      .map((l) => ({ ...l }));
    return { nodes, links };
  }, [graphData, hiddenCommunities]);

  const handleSearch = () => {
    if (!graphData) return;
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;

    const node = filteredGraphData.nodes.find((item) =>
      item.id.toLowerCase().includes(normalized),
    );
    if (!node) return;

    onNodeSelect(node.id);

    const x = (node as any).x;
    const y = (node as any).y;

    if (x === undefined || y === undefined) return;

    graphRef.current?.centerAt(x, y, 600);
    graphRef.current?.zoom(6, 600);
  };

  const toggleCommunity = (id: number) => {
    const next = new Set(hiddenCommunities);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setHiddenCommunities(next);
  };

  const selectedNode = useMemo(() => {
    if (!highlightNodeId || !graphData) return null;
    return graphData.nodes.find((n) => n.id === highlightNodeId);
  }, [highlightNodeId, graphData]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0F19] flex">
      <div ref={containerRef} className="grow relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-20 text-on-surface-variant hover:text-primary transition-colors bg-[#0B0F19]/60 p-2 rounded-full backdrop-blur-md border border-outline-variant"
        >
          <X className="w-5 h-5" />
        </button>

        {size.width > 0 && (
          <ForceGraph2D
            ref={graphRef}
            width={size.width}
            height={size.height}
            graphData={filteredGraphData}
            backgroundColor="#0B0F19"
            linkColor={() => "rgba(255, 255, 255, 0.08)"}
            onNodeClick={(node: any) => onNodeSelect(node.id)}
            nodeLabel={(node: any) => nodeTooltip(node)}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const isHighlighted = highlightNodeId && node.id === highlightNodeId;
              const size = isHighlighted ? 6 : 4;
              const color = isHighlighted ? "#FFFFFF" : getColor(node.community);
              
              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
              ctx.fillStyle = color;
              ctx.fill();
              
              // Draw border
              ctx.strokeStyle = "#0B0F19";
              ctx.lineWidth = 1 / globalScale;
              ctx.stroke();
            }}
          />
        )}
      </div>

      <aside className="w-[320px] flex-shrink-0 border-l border-outline-variant bg-[#0B0F19]/40 backdrop-blur-xl flex flex-col">
        <div className="p-4 border-b border-outline-variant flex items-center justify-end">
          <button className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-on-surface">
            <Bookmark className="w-3 h-3" />
            All Bookmarks
          </button>
        </div>

        <div className="p-6 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                placeholder="Search nodes..."
                className="w-full bg-[#1E293B]/40 border border-outline-variant rounded-md pl-10 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">
              Node Info
            </h4>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-on-surface-variant">ID</div>
                  <div className="text-sm font-medium text-on-surface truncate">
                    {selectedNode.id}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedNode.metrics || {}).map(
                    ([key, val]) => (
                      <div key={key}>
                        <div className="text-[10px] text-on-surface-variant uppercase">
                          {key}
                        </div>
                        <div className="text-sm font-mono text-on-surface">
                          {typeof val === "number" ? val.toFixed(4) : val}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic">
                Click a node to inspect it
              </p>
            )}
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Communities
              </h4>
            </div>
            <div className="space-y-1 overflow-y-auto pr-2 max-h-[400px]">
              {communities.map((comm) => (
                <div
                  key={comm.id}
                  className="flex items-center gap-3 group cursor-pointer py-1"
                  onClick={() => toggleCommunity(comm.id)}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center border transition-all ${
                      hiddenCommunities.has(comm.id)
                        ? "border-outline-variant bg-transparent"
                        : "border-transparent"
                    }`}
                    style={{
                      backgroundColor: hiddenCommunities.has(comm.id)
                        ? "transparent"
                        : getColor(comm.id),
                    }}
                  >
                    {!hiddenCommunities.has(comm.id) && (
                      <div className="w-1 h-1 bg-white rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-xs flex-1 transition-colors ${
                      hiddenCommunities.has(comm.id)
                        ? "text-on-surface-variant/40"
                        : "text-on-surface-variant group-hover:text-on-surface"
                    }`}
                  >
                    Community {comm.id}
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant/40">
                    {comm.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-outline-variant bg-[#0B0F19]/60">
          <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-tighter">
            <span>{graph.nodeCount} nodes</span>
            <span>·</span>
            <span>{graph.edgeCount} edges</span>
            <span>·</span>
            <span>{communities.length} communities</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useGraph } from "@/hooks/graphs/use-graph";
import { Skeleton } from "@/components/skeleton";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { apolloClient } from "@/lib/apollo-client";
import {
  DELETE_GRAPH_MUTATION,
  REGENERATE_GRAPH_MUTATION,
} from "@/lib/graphql/mutations";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  FolderOpen,
  RefreshCcw,
  Search,
  Trash2,
  Activity,
  Layers,
  User,
  Info,
  Compass,
} from "lucide-react";
import { DeleteModal } from "@/components/dashboard/delete-modal";

export type MetricKey =
  | "pagerank"
  | "degreeCentrality"
  | "betweennessCentrality"
  | "closenessCentrality"
  | "eigenvectorCentrality";

export type GraphNode = {
  id: string;
  x?: number;
  y?: number;
  community?: number;
  metrics?: Record<string, number>;
};

export type GraphLink = {
  source: string;
  target: string;
  weight?: number;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

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

export default function GraphDetailPage() {
  const params = useParams<{ id: string }>();
  const graphId = params.id;
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: graph, isLoading } = useGraph(graphId);
  const queryClient = useQueryClient();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Search & Filtering
  const [query, setQuery] = useState("");
  const [hiddenCommunities, setHiddenCommunities] = useState<Set<number>>(
    new Set(),
  );
  const [sidebarTab, setSidebarTab] = useState<
    "metrics" | "inspector" | "communities"
  >("metrics");

  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const router = useRouter();

  const ForceGraph2D = dynamic(
    () => import("react-force-graph-2d").then((mod) => mod.default),
    { ssr: false },
  );

  // ResizeObserver for Integrated Graph Container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setCanvasSize({ width, height: height || 520 });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [graph]);

  useEffect(() => {
    if (!isAuthPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isAuthPending, router]);

  const rawGraphData = graph?.graphData as GraphData | undefined;

  // Clone graph data once into state to prevent resetting coordinates on every render
  // and to avoid write errors on read-only/frozen objects from Apollo/React Query
  const [mutableGraph, setMutableGraph] = useState<{
    nodes: any[];
    links: any[];
  }>({ nodes: [], links: [] });

  useEffect(() => {
    if (rawGraphData) {
      setMutableGraph({
        nodes: rawGraphData.nodes.map((n) => ({ ...n })),
        links: rawGraphData.links.map((l) => ({ ...l })),
      });
    } else {
      setMutableGraph({ nodes: [], links: [] });
    }
  }, [rawGraphData]);

  // Filter nodes & links based on hidden communities
  const filteredGraphData = useMemo(() => {
    const { nodes: allNodes, links: allLinks } = mutableGraph;
    if (!allNodes.length) return { nodes: [], links: [] };

    const nodes = allNodes.filter(
      (n) => !hiddenCommunities.has(n.community ?? 0),
    );
    const nodeIds = new Set(nodes.map((n) => n.id));

    const links = allLinks.filter((l) => {
      const srcId =
        typeof l.source === "object" ? (l.source as any).id : l.source;
      const tgtId =
        typeof l.target === "object" ? (l.target as any).id : l.target;
      return nodeIds.has(srcId) && nodeIds.has(tgtId);
    });

    return { nodes, links };
  }, [mutableGraph, hiddenCommunities]);

  const sizeForNode = (node: any) => {
    const baseSize = 5;
    return highlightNodeId && node.id === highlightNodeId
      ? baseSize + 3
      : baseSize;
  };

  const colorForNode = (node: any) => {
    if (highlightNodeId && node.id === highlightNodeId) {
      return isDark ? "#FFFFFF" : "#0F172A";
    }
    return COMMUNITY_COLORS[(node.community ?? 0) % COMMUNITY_COLORS.length];
  };

  const communities = useMemo(() => {
    if (!rawGraphData) return [];
    const counts: Record<number, number> = {};
    rawGraphData.nodes.forEach((n) => {
      const c = n.community ?? 0;
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([id, count]) => ({ id: Number(id), count }))
      .sort((a, b) => b.count - a.count);
  }, [rawGraphData]);

  const selectedNode = useMemo(() => {
    if (!highlightNodeId || !rawGraphData) return null;
    return rawGraphData.nodes.find((n) => n.id === highlightNodeId);
  }, [highlightNodeId, rawGraphData]);

  const handleSearch = () => {
    if (!rawGraphData) return;
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;

    const node = filteredGraphData.nodes.find((item) =>
      item.id.toLowerCase().includes(normalized),
    );
    if (!node) {
      toast.error("Node not found");
      return;
    }

    setHighlightNodeId(node.id);
    setSidebarTab("inspector");

    const x = (node as any).x;
    const y = (node as any).y;
    if (x === undefined || y === undefined) return;

    graphRef.current?.centerAt(x, y, 600);
    graphRef.current?.zoom(5, 600);
  };

  const toggleCommunity = (id: number) => {
    const next = new Set(hiddenCommunities);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setHiddenCommunities(next);
  };

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
      toast.success("Graph reprocessing started.");
      queryClient.invalidateQueries({ queryKey: ["graphs", graph.id] });
      queryClient.invalidateQueries({ queryKey: ["graphs"] });
    } catch (error) {
      toast.error("Failed to regenerate graph.");
    }
  };

  if (isAuthPending || isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-[600px] lg:col-span-3 rounded-2xl" />
          <Skeleton className="h-[600px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Graph not found.
      </div>
    );
  }

  if (graph.status === "FAILED")
    console.error("Graph processing failed:", graph.errorMessage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-foreground">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 border border-primary-container/20 bg-primary-container/5 dark:border-[#c0c1ff]/20 dark:bg-[#c0c1ff]/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-primary-container dark:text-[#c0c1ff] mb-3 rounded-full">
            Network Workspace
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-500 bg-clip-text text-transparent">
            {graph.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              Dataset:{" "}
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {graph.dataset.name}
              </span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>
              Source:{" "}
              <span className="text-primary-container dark:text-[#c0c1ff] font-semibold font-mono text-xs bg-primary-container/5 dark:bg-[#c0c1ff]/5 px-2 py-0.5 rounded-lg border border-primary-container/10 dark:border-[#c0c1ff]/10">
                {graph.sourceColumn ?? "-"}
              </span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>
              Target:{" "}
              <span className="text-primary-container dark:text-[#c0c1ff] font-semibold font-mono text-xs bg-primary-container/5 dark:bg-[#c0c1ff]/5 px-2 py-0.5 rounded-lg border border-primary-container/10 dark:border-[#c0c1ff]/10">
                {graph.targetColumn ?? "-"}
              </span>
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() =>
              router.push(`/dashboard/datasets/${graph.dataset.id}`)
            }
            className="border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-semibold tracking-wide uppercase flex items-center gap-2 transition duration-200 rounded-lg"
          >
            <FolderOpen className="w-4 h-4" />
            Dataset
          </button>
          <button
            onClick={handleRegenerateGraph}
            className="border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-semibold tracking-wide uppercase flex items-center gap-2 transition duration-200 rounded-lg"
          >
            <RefreshCcw className="w-4 h-4" />
            Regenerate
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 px-4 py-2 text-xs font-semibold tracking-wide uppercase flex items-center gap-2 transition duration-200 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </header>

      {graph.status === "PROCESSING" ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg flex items-center gap-3">
          <Activity className="w-4 h-4 animate-spin" />
          Graph is currently being processed. Please check back later.
        </div>
      ) : graph.status === "FAILED" ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
          <Info className="w-4 h-4" />
          Graph processing failed. Please try regenerating the graph or contact
          support.
        </div>
      ) : graph.status === "READY" ? (
        <>
          {/* Main Graph UI */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Left Column: Visualizer Canvas Container (70%) */}
            <div className="lg:col-span-7 flex flex-col bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl h-[650px] relative">
              {/* Controls Overlay Header */}
              <div className="z-10 bg-slate-50/95 dark:bg-[#161a2b]/95 border-b border-slate-200 dark:border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 border border-primary-container/20 bg-primary-container/5 dark:border-[#c0c1ff]/20 dark:bg-[#c0c1ff]/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-primary-container dark:text-[#c0c1ff] rounded-lg font-semibold">
                    Network Visualizer
                  </div>
                </div>

                {/* Quick Actions & Search */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search nodes..."
                      className="bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 px-8 py-1.5 rounded-lg focus:outline-none w-36 focus:w-48 transition-all duration-300 focus:border-primary-container/50 dark:focus:border-[#c0c1ff]/50"
                    />
                  </div>

                  <button
                    onClick={() => {
                      graphRef.current?.zoomToFit(400, 30);
                      setHighlightNodeId(null);
                    }}
                    title="Fit to Screen"
                    className="p-1.5 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-650 dark:text-slate-300"
                  >
                    <Compass className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Canvas Render Area */}
              <div
                ref={containerRef}
                className="grow bg-slate-50 dark:bg-[#090b14] relative"
              >
                {canvasSize.width > 0 && rawGraphData && (
                  <ForceGraph2D
                    ref={graphRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    graphData={filteredGraphData}
                    backgroundColor={isDark ? "#090b14" : "#f8fafc"}
                    nodeRelSize={4}
                    nodeVal={sizeForNode}
                    nodeColor={colorForNode}
                    linkColor={() =>
                      isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.08)"
                    }
                    onNodeClick={(node: any) => setHighlightNodeId(node.id)}
                    nodeLabel={(node: any) =>
                      `${node.id}\n(Click to inspect properties)`
                    }
                    enableNodeDrag={rawGraphData.nodes.length < 1500}
                    nodeCanvasObject={(
                      node: any,
                      ctx: CanvasRenderingContext2D,
                      globalScale: number,
                    ) => {
                      const isHighlighted =
                        highlightNodeId && node.id === highlightNodeId;
                      const size = sizeForNode(node);
                      const color = colorForNode(node);

                      ctx.beginPath();
                      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                      ctx.fillStyle = color;
                      ctx.fill();

                      // Highlight ring
                      if (isHighlighted) {
                        ctx.strokeStyle = isDark ? "#FFFFFF" : "#0F172A";
                        ctx.lineWidth = 2 / globalScale;
                        ctx.stroke();
                      } else {
                        ctx.strokeStyle = isDark ? "#090b14" : "#f8fafc";
                        ctx.lineWidth = 1 / globalScale;
                        ctx.stroke();
                      }
                    }}
                  />
                )}

                {/* Interactive instructions */}
                <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur border border-slate-200 dark:border-white/5 px-3 py-1.5 rounded-lg pointer-events-none">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Left Click: drag node/pan view · Scroll: zoom in/out · Click
                    node to inspect
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Information & Inspection Tabs (30%) */}
            <div className="lg:col-span-3 flex flex-col bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl h-[650px]">
              {/* Tab Selection */}
              <div className="grid grid-cols-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161a2b]">
                <button
                  onClick={() => setSidebarTab("metrics")}
                  className={`py-3.5 text-xs font-bold transition-all flex flex-col items-center gap-1 border-b-2 ${
                    sidebarTab === "metrics"
                      ? "border-primary-container dark:border-[#c0c1ff] text-primary-container dark:text-[#c0c1ff] bg-primary-container/5 dark:bg-[#c0c1ff]/5"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Network
                </button>
                <button
                  onClick={() => setSidebarTab("inspector")}
                  className={`py-3.5 text-xs font-bold transition-all flex flex-col items-center gap-1 border-b-2 ${
                    sidebarTab === "inspector"
                      ? "border-primary-container dark:border-[#c0c1ff] text-primary-container dark:text-[#c0c1ff] bg-primary-container/5 dark:bg-[#c0c1ff]/5"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Inspector
                </button>
                <button
                  onClick={() => setSidebarTab("communities")}
                  className={`py-3.5 text-xs font-bold transition-all flex flex-col items-center gap-1 border-b-2 ${
                    sidebarTab === "communities"
                      ? "border-primary-container dark:border-[#c0c1ff] text-primary-container dark:text-[#c0c1ff] bg-primary-container/5 dark:bg-[#c0c1ff]/5"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Legend
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {/* Tab: Network Metrics */}
                {sidebarTab === "metrics" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                      <Info className="w-4 h-4 text-primary-container dark:text-[#c0c1ff]" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                        Diagnostics Summary
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { label: "Total Nodes", val: graph.nodeCount },
                        { label: "Total Edges", val: graph.edgeCount },
                        { label: "Source Column", val: graph.sourceColumn },
                        { label: "Target Column", val: graph.targetColumn },
                        { label: "Density", val: graph.density?.toFixed(5) },
                        {
                          label: "Weakly Components",
                          val: graph.componentsCount,
                        },
                        {
                          label: "Louvain Communities",
                          val: communities.length,
                        },
                        {
                          label: "Average Degree",
                          val: graph.averageDegree?.toFixed(4),
                        },
                        { label: "Network Diameter", val: graph.diameter },
                        {
                          label: "Clustering Coefficient",
                          val: graph.clusteringCoefficient?.toFixed(4),
                        },
                      ].map(({ label, val }) => (
                        <div
                          key={label}
                          className="flex justify-between items-center bg-slate-50 dark:bg-black/25 border border-slate-100 dark:border-white/5 px-3.5 py-2.5 rounded-lg"
                        >
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {label}
                          </span>
                          <span
                            className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]"
                            title={val?.toString() ?? ""}
                          >
                            {val ?? "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Node Inspector */}
                {sidebarTab === "inspector" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                      <User className="w-4 h-4 text-primary-container dark:text-[#c0c1ff]" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                        Node Properties
                      </span>
                    </div>

                    {selectedNode ? (
                      <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 p-3 rounded-lg">
                          <span className="text-[10px] text-slate-550 dark:text-slate-400 uppercase font-medium">
                            Identifier
                          </span>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                            {selectedNode.id}
                          </div>
                          <div className="text-[10px] text-primary-container dark:text-[#c0c1ff] mt-1">
                            Community Cluster: {selectedNode.community ?? 0}
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {[
                            {
                              key: "degreeCentrality",
                              label: "Degree Centrality",
                            },
                            {
                              key: "betweennessCentrality",
                              label: "Betweenness Centrality",
                            },
                            {
                              key: "closenessCentrality",
                              label: "Closeness Centrality",
                            },
                            {
                              key: "eigenvectorCentrality",
                              label: "Eigenvector Centrality",
                            },
                            { key: "pagerank", label: "PageRank" },
                          ].map(({ key, label }) => {
                            const val = (selectedNode.metrics as any)?.[key];
                            return (
                              <div
                                key={key}
                                className="flex justify-between items-center bg-slate-50 dark:bg-black/25 border border-slate-100 dark:border-white/5 px-3 py-2 rounded-lg"
                              >
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {label}
                                </span>
                                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                  {typeof val === "number"
                                    ? val.toFixed(5)
                                    : "-"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Info className="w-8 h-8 text-slate-450 dark:text-slate-600 mb-2" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          Click a node on the canvas to inspect its centrality
                          properties
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Communities List */}
                {sidebarTab === "communities" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                      <Layers className="w-4 h-4 text-primary-container dark:text-[#c0c1ff]" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                        Cluster Legend
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                      Toggle clusters to isolate subgraph elements.
                    </p>

                    <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                      {communities.map((comm) => {
                        const isHidden = hiddenCommunities.has(comm.id);
                        const color =
                          COMMUNITY_COLORS[comm.id % COMMUNITY_COLORS.length];
                        return (
                          <div
                            key={comm.id}
                            onClick={() => toggleCommunity(comm.id)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition border ${
                              isHidden
                                ? "bg-transparent border-slate-100 dark:border-white/5 opacity-40 hover:opacity-60"
                                : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-black/35"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-3 h-3 rounded-full shrink-0 border"
                                style={{
                                  backgroundColor: isHidden
                                    ? "transparent"
                                    : color,
                                  borderColor: color,
                                }}
                              />
                              <span
                                className={`text-xs ${isHidden ? "text-slate-400" : "text-slate-800 dark:text-slate-200"}`}
                              >
                                Cluster {comm.id}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-white/5 px-2 py-0.5 rounded">
                              {comm.count} nodes
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer info strip */}
              <div className="p-4 bg-slate-50 dark:bg-[#161a2b] border-t border-slate-200 dark:border-white/10 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wide">
                  {rawGraphData?.nodes?.length || 0} nodes ·{" "}
                  {rawGraphData?.links?.length || 0} edges
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg flex items-center gap-3">
          <Activity className="w-4 h-4 animate-spin" />
          Graph is currently being processed. Please check back later.
        </div>
      )}

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
    </div>
  );
}

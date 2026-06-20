"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Network,
  Plus,
  RefreshCcw,
  RefreshCw,
  Search,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useGraphs } from "@/hooks/graphs/use-graphs";
import { Skeleton } from "@/components/skeleton";
import { apolloClient } from "@/lib/apollo-client";
import { DELETE_GRAPH_MUTATION } from "@/lib/graphql/mutations";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/format-date";
import { CreateGraphModal } from "@/components/dashboard/create-graph-modal";
import { DeleteModal } from "@/components/dashboard/delete-modal";

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function GraphsPage() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: graphs, isLoading } = useGraphs();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingGraph, setDeletingGraph] = useState<
    { id: string; name: string } | undefined
  >(undefined);
  const router = useRouter();

  const filteredGraphs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return graphs ?? [];
    return (graphs ?? []).filter((graph) =>
      [graph.name, graph.dataset.name, graph.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [graphs, search]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["graphs"] });
    toast.success("Refreshed graphs index.");
  };

  useEffect(() => {
    if (!isAuthPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isAuthPending, router]);

  if (isAuthPending) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0B0F19] text-foreground min-h-screen flex flex-col">
      <main className="grow transition-all duration-300 px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 border border-[#8083ff]/20 bg-[#8083ff]/5 dark:border-[#c0c1ff]/20 dark:bg-[#c0c1ff]/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#8083ff] dark:text-[#c0c1ff] rounded-full mb-3">
                Knowledge Workspace
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-500 bg-clip-text text-transparent">
                Graphs
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Saved graph projects with metrics and datasets.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#8083ff] hover:bg-[#6c6fed] text-white px-5 py-2.5 text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(192,193,255,0.25)] rounded-lg active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Create Graph
              </button>
              <button
                onClick={handleRefresh}
                className="border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2 transition duration-200 rounded-lg"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </header>

          {/* Search box card */}
          <div className="bg-white dark:bg-[#111420]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search graphs by name, dataset..."
                className="w-full bg-transparent text-slate-800 dark:text-slate-200 text-sm focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Table list card */}
          <section className="bg-white dark:bg-[#111420]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-sm dark:shadow-xl overflow-hidden">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`graph-skeleton-${index}`}
                    className="border border-slate-200/50 dark:border-white/5 bg-slate-100 dark:bg-black/10 rounded-xl p-5 space-y-3 animate-pulse"
                  >
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            ) : filteredGraphs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Network className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No graphs found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGraphs.map((graph) => (
                  <div
                    key={graph.id}
                    className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-5 hover:border-[#8083ff]/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-100/50 dark:hover:bg-black/35 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/dashboard/graphs/${graph.id}`}>
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#8083ff] dark:group-hover:text-[#c0c1ff] transition-colors text-base">
                            {graph.name}
                          </h3>
                          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
                            Dataset: {graph.dataset.name}
                          </p>
                        </Link>
                        <div className="shrink-0">
                          {graph.status === "PROCESSING" ? (
                            <RefreshCw className="w-5 h-5 text-[#8083ff] animate-spin" />
                          ) : graph.status === "FAILED" ? (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            <Network className="w-5 h-5 text-[#8083ff] dark:text-[#c0c1ff]" />
                          )}
                        </div>
                      </div>
 
                      {/* Mini Stats Info block */}
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-lg p-2.5">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Nodes</span>
                          <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-200">{graph.nodeCount ?? "-"}</span>
                        </div>
                        <div className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-lg p-2.5">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Edges</span>
                          <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-200">{graph.edgeCount ?? "-"}</span>
                        </div>
                        <div className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-lg p-2.5 overflow-hidden">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Source</span>
                          <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-200 truncate block" title={graph.sourceColumn ?? ""}>
                            {graph.sourceColumn ?? "-"}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-lg p-2.5 overflow-hidden">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Target</span>
                          <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-200 truncate block" title={graph.targetColumn ?? ""}>
                            {graph.targetColumn ?? "-"}
                          </span>
                        </div>
                      </div>
                    </div>
 
                    <div className="mt-6 pt-4 border-t border-slate-205 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="text-[11px] font-mono">{formatDate(graph.updatedAt)}</span>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/graphs/${graph.id}`}
                          className="text-[#8083ff] dark:text-[#c0c1ff] hover:underline text-xs font-semibold uppercase tracking-wider"
                        >
                          View
                        </Link>
                        <button
                          onClick={() =>
                            setDeletingGraph({ id: graph.id, name: graph.name })
                          }
                          className="text-red-400 hover:text-red-300 text-xs font-semibold uppercase tracking-wider"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
 
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <CreateGraphModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <DeleteModal
        isOpen={Boolean(deletingGraph)}
        t={deletingGraph}
        onClose={() => setDeletingGraph(undefined)}
        onDeleted={() => {
          queryClient.invalidateQueries({ queryKey: ["graphs"] });
        }}
        deleteT={async (id: string) => {
          await apolloClient.mutate({
            mutation: DELETE_GRAPH_MUTATION,
            variables: { id },
          });
        }}
      />
    </div>
  );
}

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

export default function GraphsPage() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: graphs, isLoading } = useGraphs();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingGraph, setDeletingGraph] = useState<
    { id: number; name: string } | undefined
  >(undefined);
  const router = useRouter();

  const filteredGraphs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return graphs ?? [];
    return (graphs ?? []).filter((graph) =>
      [graph.name, graph.dataset.name, graph.status]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [graphs, search]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["graphs"] });
    toast("Refreshing graphs...");
  };

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

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <main className="grow transition-[margin] duration-300">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                Graphs
              </h2>
              <p className="text-on-surface-variant font-body-md text-body-md">
                Saved graph projects with metrics and datasets.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-inverse-primary hover:bg-primary-container text-white px-6 py-3 rounded-DEFAULT font-label-mono text-label-mono font-medium transition-colors shadow-[0_0_12px_rgba(192,193,255,0.2)] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Graph
              </button>
              <button
                onClick={handleRefresh}
                className="bg-[#1E293B] hover:bg-secondary-container text-white px-6 py-3 rounded-DEFAULT font-label-mono text-label-mono font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh Graphs
              </button>
            </div>
          </header>

          <div className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-4">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-on-surface-variant" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search graphs by name, dataset, status"
                className="w-full bg-transparent text-on-surface text-sm focus:outline-none"
              />
            </div>
          </div>

          <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`graph-skeleton-${index}`}
                    className="border border-outline-variant/40 rounded-DEFAULT p-4 space-y-3"
                  >
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {filteredGraphs.length === 0 ? (
                  <p className="text-on-surface-variant">No graphs for now.</p>
                ) : (
                  filteredGraphs.map((graph) => (
                    <div
                      key={graph.id}
                      className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-5 hover:border-primary/40 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/dashboard/graphs/${graph.id}`}>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                            {graph.name}
                          </h3>
                          <p className="text-on-surface-variant text-xs mt-1">
                            Dataset: {graph.dataset.name}
                          </p>
                        </Link>
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
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-[#0B0F19] border border-outline-variant/40 rounded-DEFAULT p-3">
                          <p className="text-xs text-on-surface-variant">
                            Nodes
                          </p>
                          <p className="text-on-surface font-label-mono text-label-mono">
                            {graph.nodeCount ?? "-"}
                          </p>
                        </div>
                        <div className="bg-[#0B0F19] border border-outline-variant/40 rounded-DEFAULT p-3">
                          <p className="text-xs text-on-surface-variant">
                            Edges
                          </p>
                          <p className="text-on-surface font-label-mono text-label-mono">
                            {graph.edgeCount ?? "-"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-on-surface-variant">
                        <span>{formatDate(graph.updatedAt)}</span>
                        <button
                          onClick={() =>
                            setDeletingGraph({ id: graph.id, name: graph.name })
                          }
                          className="text-error font-label-mono text-label-mono"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        </div>
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
          deleteT={async (id: number) => {
            try {
              await apolloClient.mutate({
                mutation: DELETE_GRAPH_MUTATION,
                variables: { id },
              });
            } catch (error: any) {
              throw error;
            }
          }}
        />
      </main>
    </div>
  );
}

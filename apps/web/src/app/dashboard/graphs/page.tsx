"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useGraphs } from "@/hooks/graphs/use-graphs";
import { Skeleton } from "@/components/skeleton";

export default function GraphsPage() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: graphs, isLoading } = useGraphs();

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

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <Sidebar />
      <main className="ml-[var(--sidebar-width,theme(spacing.panel-width))] grow p-margin-desktop bg-[#0F1117] transition-[margin] duration-300">
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
          </header>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(graphs ?? []).length === 0 ? (
                  <p className="text-on-surface-variant">No graphs for now.</p>
                ) : (
                  (graphs ?? []).map((graph) => (
                    <Link
                      key={graph.id}
                      href={`/dashboard/graphs/${graph.id}`}
                      className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface">
                            {graph.name}
                          </h3>
                          <p className="text-on-surface-variant text-xs mt-1">
                            Dataset: {graph.dataset.name}
                          </p>
                        </div>
                        <span className="text-on-surface-variant font-label-mono text-label-mono">
                          {graph.status}
                        </span>
                      </div>
                      <div className="mt-4 text-on-surface-variant font-label-mono text-label-mono">
                        {graph.nodeCount ?? "-"} nodes · {graph.edgeCount ?? "-"} edges
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

"use client";

import { redirect, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useGraph } from "@/hooks/graphs/use-graph";
import { Skeleton } from "@/components/skeleton";

export default function GraphDetailPage() {
  const params = useParams<{ id: string }>();
  const graphId = Number(params.id);
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: graph, isLoading } = useGraph(graphId);

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
              </header>

              <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                    <p className="text-on-surface-variant text-xs">Status</p>
                    <p className="text-on-surface font-label-mono text-label-mono">
                      {graph.status}
                    </p>
                  </div>
                  <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                    <p className="text-on-surface-variant text-xs">Layout</p>
                    <p className="text-on-surface font-label-mono text-label-mono">
                      {graph.layoutPreference}
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
                    <p className="text-on-surface-variant text-xs">Components</p>
                    <p className="text-on-surface font-label-mono text-label-mono">
                      {graph.componentsCount ?? "-"}
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

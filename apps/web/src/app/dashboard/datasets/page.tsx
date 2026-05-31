"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, UploadCloud } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useDatasets } from "@/hooks/datasets/use-datasets";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/skeleton";
import { UploadDatasetModal } from "@/components/dashboard/upload-dataset-modal";
import { EditDatasetModal } from "@/components/dashboard/edit-dataset-modal";
import { DeleteDatasetModal } from "@/components/dashboard/delete-dataset-modal";
import { formatDate } from "@/lib/format-date";

export default function DatasetsPage() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: datasets, isLoading } = useDatasets();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingDataset, setEditingDataset] = useState<
    { id: number; name: string; description?: string | null } | undefined
  >(undefined);
  const [deletingDataset, setDeletingDataset] = useState<
    { id: number; name: string } | undefined
  >(undefined);

  const filteredDatasets = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return datasets ?? [];
    return (datasets ?? []).filter((dataset) =>
      [dataset.name, dataset.description ?? "", dataset.status]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [datasets, search]);

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
      <main className="ml-(--sidebar-width,var(--spacing-panel-width)) grow p-margin-desktop bg-[#0F1117] transition-[margin] duration-300">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                Datasets
              </h2>
              <p className="text-on-surface-variant font-body-md text-body-md">
                All CSV uploads with processing status and storage details.
              </p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-inverse-primary hover:bg-primary-container text-white px-4 py-2 rounded-DEFAULT font-label-mono text-label-mono flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Upload dataset
            </button>
          </header>

          <div className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-4">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-on-surface-variant" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search datasets by name, description, status"
                className="w-full bg-transparent text-on-surface text-sm focus:outline-none"
              />
            </div>
          </div>

          <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`dataset-skeleton-${index}`}
                    className="flex items-center gap-4 border border-outline-variant/40 rounded-DEFAULT p-4"
                  >
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-on-surface-variant font-label-mono text-label-mono">
                      <th className="py-3 pr-4 border-b border-outline-variant">
                        Name
                      </th>
                      <th className="py-3 pr-4 border-b border-outline-variant">
                        Status
                      </th>
                      <th className="py-3 pr-4 border-b border-outline-variant">
                        Size
                      </th>
                      <th className="py-3 border-b border-outline-variant">
                        Updated
                      </th>
                      <th className="py-3 border-b border-outline-variant text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDatasets.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-on-surface-variant text-center"
                        >
                          No datasets found.
                        </td>
                      </tr>
                    ) : (
                      filteredDatasets.map((dataset) => (
                        <tr
                          key={dataset.id}
                          className="border-b border-outline-variant/40 hover:bg-surface-container-highest/30 transition-colors"
                        >
                          <td className="py-4 pr-4 text-on-surface">
                            <Link
                              href={`/dashboard/datasets/${dataset.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {dataset.name}
                            </Link>
                          </td>
                          <td className="py-4 pr-4 text-on-surface-variant font-label-mono text-label-mono">
                            {dataset.status}
                          </td>
                          <td className="py-4 pr-4 text-on-surface-variant font-label-mono text-label-mono">
                            {dataset.sizeBytes
                              ? `${(dataset.sizeBytes / 1024).toFixed(1)} KB`
                              : "-"}
                          </td>
                          <td className="py-4 text-on-surface-variant font-label-mono text-label-mono">
                            {formatDate(dataset.updatedAt)}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Link
                                href={`/dashboard/datasets/${dataset.id}`}
                                className="text-primary font-label-mono text-label-mono"
                              >
                                View
                              </Link>
                              <button
                                onClick={() =>
                                  setEditingDataset({
                                    id: dataset.id,
                                    name: dataset.name,
                                    description: dataset.description,
                                  })
                                }
                                className="text-on-surface-variant hover:text-primary font-label-mono text-label-mono"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  setDeletingDataset({
                                    id: dataset.id,
                                    name: dataset.name,
                                  })
                                }
                                className="text-error font-label-mono text-label-mono"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
      <UploadDatasetModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={() =>
          queryClient.invalidateQueries({ queryKey: ["datasets"] })
        }
      />
      <EditDatasetModal
        isOpen={Boolean(editingDataset)}
        dataset={editingDataset}
        onClose={() => setEditingDataset(undefined)}
        onSaved={() =>
          queryClient.invalidateQueries({ queryKey: ["datasets"] })
        }
      />
      <DeleteDatasetModal
        isOpen={Boolean(deletingDataset)}
        dataset={deletingDataset}
        onClose={() => setDeletingDataset(undefined)}
        onDeleted={() =>
          queryClient.invalidateQueries({ queryKey: ["datasets"] })
        }
      />
    </div>
  );
}

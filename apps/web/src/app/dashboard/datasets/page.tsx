"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UploadCloud, FileSpreadsheet, Edit3, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useDatasets } from "@/hooks/datasets/use-datasets";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/skeleton";
import { UploadDatasetModal } from "@/components/dashboard/upload-dataset-modal";
import { EditDatasetModal } from "@/components/dashboard/edit-dataset-modal";
import { DeleteModal } from "@/components/dashboard/delete-modal";
import { formatDate } from "@/lib/format-date";
import { deleteDataset } from "@/lib/datasets";

export default function DatasetsPage() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: datasets, isLoading } = useDatasets();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingDataset, setEditingDataset] = useState<
    { id: string; name: string; description?: string | null } | undefined
  >(undefined);
  const [deletingDataset, setDeletingDataset] = useState<
    { id: string; name: string } | undefined
  >(undefined);
  const router = useRouter();

  const filteredDatasets = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return datasets ?? [];
    return (datasets ?? []).filter((dataset) =>
      [dataset.name, dataset.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [datasets, search]);

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
                Dataset Library
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-500 bg-clip-text text-transparent">
                Datasets
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                All CSV uploads with processing status and storage details.
              </p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-[#8083ff] hover:bg-[#6c6fed] text-white px-5 py-2.5 text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(192,193,255,0.25)] rounded-lg active:scale-[0.98]"
            >
              <UploadCloud className="w-4 h-4" />
              Upload dataset
            </button>
          </header>

          {/* Search box card */}
          <div className="bg-white dark:bg-[#111420]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search datasets by name, description..."
                className="w-full bg-transparent text-slate-800 dark:text-slate-200 text-sm focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Main datasets library list card */}
          <section className="bg-white dark:bg-[#111420]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-sm dark:shadow-xl overflow-hidden">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`dataset-skeleton-${index}`}
                    className="flex items-center justify-between border border-slate-200/50 dark:border-white/5 bg-slate-100 dark:bg-black/10 rounded-xl p-4 animate-pulse"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDatasets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileSpreadsheet className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No datasets found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDatasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 p-5 hover:border-[#8083ff]/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-100/50 dark:hover:bg-black/30 rounded-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/dashboard/datasets/${dataset.id}`} className="group-hover:text-[#8083ff] dark:group-hover:text-[#c0c1ff] transition-colors">
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{dataset.name}</h3>
                        </Link>
                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-white/5 px-2.5 py-1 rounded-md">
                          {dataset.sizeBytes ? `${(dataset.sizeBytes / 1024).toFixed(1)} KB` : "-"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 min-h-[2rem]">
                        {dataset.description || "No description provided."}
                      </p>
                    </div>
 
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="text-[11px] font-mono">{formatDate(dataset.updatedAt)}</span>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/datasets/${dataset.id}`}
                          className="text-[#8083ff] dark:text-[#c0c1ff] hover:underline text-xs font-semibold uppercase tracking-wider"
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
                          className="text-slate-500 hover:text-[#8083ff] dark:text-slate-400 dark:hover:text-[#c0c1ff] text-xs font-semibold uppercase tracking-wider"
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
      <DeleteModal
        isOpen={Boolean(deletingDataset)}
        t={deletingDataset}
        onClose={() => setDeletingDataset(undefined)}
        onDeleted={() =>
          queryClient.invalidateQueries({ queryKey: ["datasets"] })
        }
        deleteT={deleteDataset}
      />
    </div>
  );
}

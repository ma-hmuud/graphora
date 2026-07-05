"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit, ExternalLink, Trash2, Database } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useDataset } from "@/hooks/datasets/use-dataset";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/skeleton";
import { EditDatasetModal } from "@/components/dashboard/edit-dataset-modal";
import { DeleteModal } from "@/components/dashboard/delete-modal";
import { DatasetOverview } from "@/components/dashboard/dataset-overview";
import { formatDate } from "@/lib/format-date";
import { deleteDataset } from "@/lib/datasets";

export default function DatasetDetailPage() {
  const params = useParams<{ id: string }>();
  const datasetId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: dataset, isLoading } = useDataset(datasetId);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
              <div className="inline-flex items-center gap-2 border border-primary-container/20 bg-primary-container/5 dark:border-[#c0c1ff]/20 dark:bg-[#c0c1ff]/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-primary-container dark:text-[#c0c1ff] rounded-full mb-3">
                Dataset Details
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-500 bg-clip-text text-transparent">
                    {dataset?.name ?? "Dataset"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {dataset?.description ||
                      "Dataset overview and processing details."}
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditOpen(true)}
                className="border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-semibold tracking-wide uppercase flex items-center gap-2 transition duration-200 rounded-lg disabled:opacity-50"
                disabled={isLoading || !dataset}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 px-4 py-2 text-xs font-semibold tracking-wide uppercase flex items-center gap-2 transition duration-200 rounded-lg disabled:opacity-50"
                disabled={isLoading || !dataset}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </header>

          {/* Stats overview card grid */}
          <section className="bg-slate-50 dark:bg-[#111420]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-sm dark:shadow-xl">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`detail-skeleton-${index}`} className="h-20" />
                ))}
              </div>
            ) : !dataset ? (
              <p className="text-slate-500 dark:text-slate-400 italic text-sm text-center py-4">
                Dataset details not found.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-1">
                    File Size
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                    {dataset.sizeBytes
                      ? `${(dataset.sizeBytes / 1024).toFixed(1)} KB`
                      : "-"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-1">
                    Uploaded On
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatDate(dataset.createdAt)}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-1">
                    Last Updated
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatDate(dataset.updatedAt)}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-1">
                    File URL
                  </span>
                  {dataset.fileUrl ? (
                    <a
                      href={dataset.fileUrl}
                      className="text-primary-container hover:text-[#6c6fed] dark:text-[#c0c1ff] dark:hover:text-primary-fixed text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 transition-colors"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Retrieve File
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                      -
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Dataset preview container */}
          <div className="bg-white dark:bg-[#111420]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-sm dark:shadow-xl overflow-hidden">
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-primary-container dark:text-[#c0c1ff]" />
              File Preview & Sample Rows
            </h3>
            <DatasetOverview fileUrl={dataset?.fileUrl} isLoading={isLoading} />
          </div>
        </div>
      </main>

      <EditDatasetModal
        isOpen={isEditOpen}
        dataset={
          dataset
            ? {
                id: dataset.id,
                name: dataset.name,
                description: dataset.description,
              }
            : undefined
        }
        onClose={() => setIsEditOpen(false)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["datasets", datasetId] });
          queryClient.invalidateQueries({ queryKey: ["datasets"] });
        }}
      />
      <DeleteModal
        isOpen={isDeleteOpen}
        t={dataset ? { id: dataset.id, name: dataset.name } : undefined}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => {
          queryClient.invalidateQueries({ queryKey: ["datasets"] });
          router.push("/dashboard/datasets");
        }}
        deleteT={deleteDataset}
      />
    </div>
  );
}

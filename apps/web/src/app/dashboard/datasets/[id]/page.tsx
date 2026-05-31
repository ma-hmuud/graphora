"use client";

import { useState } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useDataset } from "@/hooks/datasets/use-dataset";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/skeleton";
import { EditDatasetModal } from "@/components/dashboard/edit-dataset-modal";
import { DeleteDatasetModal } from "@/components/dashboard/delete-dataset-modal";
import { DatasetOverview } from "@/components/dashboard/dataset-overview";
import { formatDate } from "@/lib/format-date";

export default function DatasetDetailPage() {
  const params = useParams<{ id: string }>();
  const datasetId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: dataset, isLoading } = useDataset(datasetId);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : (
                <>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                    {dataset?.name ?? "Dataset"}
                  </h2>
                  <p className="text-on-surface-variant font-body-md text-body-md">
                    {dataset?.description ||
                      "Dataset overview and processing details."}
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditOpen(true)}
                className="border border-outline-variant hover:border-primary text-primary px-4 py-2 rounded-DEFAULT font-label-mono text-label-mono flex items-center gap-2"
                disabled={isLoading || !dataset}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="border border-error/40 hover:border-error text-error px-4 py-2 rounded-DEFAULT font-label-mono text-label-mono flex items-center gap-2"
                disabled={isLoading || !dataset}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </header>

          <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={`detail-skeleton-${index}`} className="h-20" />
                ))}
              </div>
            ) : !dataset ? (
              <p className="text-on-surface-variant">Dataset not found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                  <p className="text-on-surface-variant text-xs">Status</p>
                  <p className="text-on-surface font-label-mono text-label-mono">
                    {dataset.status}
                  </p>
                </div>
                <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                  <p className="text-on-surface-variant text-xs">Size</p>
                  <p className="text-on-surface font-label-mono text-label-mono">
                    {dataset.sizeBytes
                      ? `${(dataset.sizeBytes / 1024).toFixed(1)} KB`
                      : "-"}
                  </p>
                </div>
                <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                  <p className="text-on-surface-variant text-xs">Created</p>
                  <p className="text-on-surface font-label-mono text-label-mono">
                    {formatDate(dataset.createdAt)}
                  </p>
                </div>
                <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                  <p className="text-on-surface-variant text-xs">Updated</p>
                  <p className="text-on-surface font-label-mono text-label-mono">
                    {formatDate(dataset.updatedAt)}
                  </p>
                </div>
                <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
                  <p className="text-on-surface-variant text-xs">File URL</p>
                  {dataset.fileUrl ? (
                    <a
                      href={dataset.fileUrl}
                      className="text-primary font-label-mono text-label-mono flex items-center gap-2"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open file
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <p className="text-on-surface font-label-mono text-label-mono">
                      -
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          <DatasetOverview fileUrl={dataset?.fileUrl} isLoading={isLoading} />
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
      <DeleteDatasetModal
        isOpen={isDeleteOpen}
        dataset={dataset ? { id: dataset.id, name: dataset.name } : undefined}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => {
          queryClient.invalidateQueries({ queryKey: ["datasets"] });
          router.push("/dashboard/datasets");
        }}
      />
    </div>
  );
}

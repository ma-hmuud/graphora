"use client";

import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteDataset } from "@/lib/datasets";
import { tryCatch } from "@/lib/try-catch";

type DeleteDatasetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dataset?: {
    id: number;
    name: string;
  };
  onDeleted?: () => void;
};

export function DeleteDatasetModal({
  isOpen,
  onClose,
  dataset,
  onDeleted,
}: DeleteDatasetModalProps) {
  if (!isOpen || !dataset) return null;

  const handleDelete = async () => {
    const { error } = await tryCatch(deleteDataset(dataset.id));
    if (error) {
      toast(error.message || "Failed to delete dataset.");
      return;
    }
    toast("Dataset deleted.");
    onDeleted?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-[#101521] border border-outline-variant rounded-DEFAULT p-6 max-w-md w-full shadow-2xl relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Delete Dataset
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-on-surface-variant mb-6">
          This will permanently delete <span className="text-on-surface">{dataset.name}</span> and
          its files. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-label-mono text-label-mono text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2 rounded-DEFAULT bg-error text-on-primary font-label-mono text-label-mono transition-colors shadow-[0_0_12px_rgba(239,68,68,0.2)] flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { updateDataset } from "@/lib/datasets";
import { tryCatch } from "@/lib/try-catch";

type EditDatasetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dataset?: {
    id: number;
    name: string;
    description?: string | null;
  };
  onSaved?: () => void;
};

export function EditDatasetModal({
  isOpen,
  onClose,
  dataset,
  onSaved,
}: EditDatasetModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(dataset?.name ?? "");
    setDescription(dataset?.description ?? "");
  }, [dataset]);

  if (!isOpen || !dataset) return null;

  const handleSave = async () => {
    if (!dataset) return;
    setIsSaving(true);
    const { error } = await tryCatch(
      updateDataset({
        id: dataset.id,
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    );
    setIsSaving(false);

    if (error) {
      toast(error.message || "Failed to update dataset.");
      return;
    }

    toast("Dataset updated.");
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-[#101521] border border-outline-variant rounded-DEFAULT p-6 max-w-lg w-full shadow-2xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Edit Dataset
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT p-4">
            <label className="block text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2">
              Dataset name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full bg-transparent text-on-surface text-sm border border-outline-variant rounded-DEFAULT px-3 py-2 focus:outline-none focus:border-primary"
              placeholder="Customer Relations 2025"
            />
          </div>
          <div className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT p-4">
            <label className="block text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full bg-transparent text-on-surface text-sm border border-outline-variant rounded-DEFAULT px-3 py-2 h-24 resize-none focus:outline-none focus:border-primary"
              placeholder="Short note about this dataset."
            />
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-outline-variant flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-label-mono text-label-mono text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-DEFAULT bg-inverse-primary hover:bg-primary-container text-white font-label-mono text-label-mono transition-colors shadow-[0_0_12px_rgba(192,193,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

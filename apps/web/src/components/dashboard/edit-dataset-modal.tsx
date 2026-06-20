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
    id: string;
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
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-lg dark:shadow-2xl relative z-10 overflow-hidden">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Edit Dataset
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4 relative z-10">
          <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4">
            <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Dataset name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full bg-white dark:bg-black/30 text-slate-850 dark:text-slate-200 text-sm border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-container/40 dark:focus:border-[#c0c1ff]/40 focus:bg-white dark:focus:bg-black/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Customer Relations 2025"
            />
          </div>
          <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4">
            <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full bg-white dark:bg-black/30 text-slate-850 dark:text-slate-200 text-sm border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 h-24 resize-none focus:outline-none focus:border-primary-container/40 dark:focus:border-[#c0c1ff]/40 focus:bg-white dark:focus:bg-black/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Short note about this dataset."
            />
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3 relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-[#6c6fed] text-white font-semibold text-xs tracking-wider uppercase transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

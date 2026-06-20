"use client";

import { useRef, useState } from "react";
import { X, UploadCloud } from "lucide-react";
import { createDataset } from "@/lib/datasets";
import { tryCatch } from "@/lib/try-catch";
import { toast } from "sonner";

type UploadDatasetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: () => void;
};

export function UploadDatasetModal({
  isOpen,
  onClose,
  onUploaded,
}: UploadDatasetModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading">("idle");

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setDescription("");
    setFile(null);
    setStatus("idle");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    if (selected) {
      const isCsv =
        selected.name.toLowerCase().endsWith(".csv") ||
        selected.type === "text/csv";
      if (!isCsv) {
        toast.error("Only CSV files are allowed.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }
    setFile(selected);
    if (selected && !name) {
      setName(selected.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!file || !name.trim()) {
      toast("Add a dataset name and file.");
      return;
    }

    setStatus("uploading");
    const { error } = await tryCatch(
      createDataset({
        name: name.trim(),
        description: description.trim() || undefined,
        file,
      }),
    );
    setStatus("idle");

    if (error) {
      toast(error.message || "Upload failed.");
      return;
    }

    toast("Dataset uploaded.");
    onUploaded?.();
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      />
      <div className="bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-lg dark:shadow-2xl relative z-10 overflow-hidden">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Upload Dataset
          </h2>
          <button
            onClick={handleClose}
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
              className="w-full bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200 text-sm border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-container/40 dark:focus:border-[#c0c1ff]/40 focus:bg-white dark:focus:bg-black/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
              className="w-full bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200 text-sm border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 h-24 resize-none focus:outline-none focus:border-primary-container/40 dark:focus:border-[#c0c1ff]/40 focus:bg-white dark:focus:bg-black/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Short note about this dataset."
            />
          </div>
          <div className="bg-slate-50 dark:bg-black/20 border border-dashed border-slate-200 dark:border-white/10 rounded-xl p-4">
            <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-3">
              Dataset file
            </label>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {file ? file.name : "No file selected"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Max 50MB. CSV only.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-slate-200 dark:border-white/10 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 bg-white/5 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 transition-colors"
                type="button"
              >
                {file ? "Replace" : "Choose"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3 relative z-10">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={status === "uploading"}
            className="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-[#6c6fed] text-white font-semibold text-xs tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "uploading" ? "Uploading..." : "Upload"}
            <UploadCloud className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

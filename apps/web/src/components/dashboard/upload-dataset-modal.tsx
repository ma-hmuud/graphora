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
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="bg-[#101521] border border-outline-variant rounded-DEFAULT p-8 max-w-lg w-full shadow-2xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Upload Dataset
          </h2>
          <button
            onClick={handleClose}
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
          <div className="bg-[#0B0F19] border border-dashed border-outline-variant rounded-DEFAULT p-4">
            <label className="block text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-3">
              Dataset file
            </label>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-on-surface">
                  {file ? file.name : "No file selected"}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Max 50MB. CSV.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-outline-variant rounded-DEFAULT text-xs uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface hover:border-primary transition"
                type="button"
              >
                {file ? "Replace" : "Choose"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-outline-variant flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 font-label-mono text-label-mono text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={status === "uploading"}
            className="px-5 py-2 rounded-DEFAULT bg-inverse-primary hover:bg-primary-container text-white font-label-mono text-label-mono transition-colors shadow-[0_0_12px_rgba(192,193,255,0.2)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "uploading" ? "Uploading..." : "Upload"}
            <UploadCloud className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

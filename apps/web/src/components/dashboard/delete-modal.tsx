"use client";

import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { tryCatch } from "@/lib/try-catch";

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  t?: {
    id: string;
    name: string;
  };
  onDeleted?: () => void;
  deleteT: (id: string) => Promise<any>;
};

export function DeleteModal({
  isOpen,
  onClose,
  t,
  onDeleted,
  deleteT,
}: DeleteModalProps) {
  if (!isOpen || !t) return null;

  const handleDelete = async () => {
    onClose();
    const { error } = await tryCatch(deleteT(t.id));
    if (error) {
      toast(error.message || `Failed to delete ${t.name}.`);
      return;
    }
    toast(`${t.name} deleted.`);
    onDeleted?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/10 rounded-2xl p-8 max-w-md w-full shadow-lg dark:shadow-2xl relative z-10 overflow-hidden">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Confirm Deletion
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-8 relative z-10">
          Are you sure you want to permanently delete <span className="font-semibold text-slate-800 dark:text-slate-200">"{t.name}"</span>? All associated records, files, and generated metrics will be removed. This action is irreversible.
        </p>

        <div className="flex justify-end gap-3 relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-xs tracking-wider uppercase transition-colors duration-200 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}

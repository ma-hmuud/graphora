"use client";

import { Plus, Sparkles } from "lucide-react";

type OverviewHeaderProps = {
  onCreateGraph: () => void;
};

export function OverviewHeader({ onCreateGraph }: OverviewHeaderProps) {
  return (
    <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-linear-to-r dark:from-white dark:via-slate-200 dark:to-slate-500 dark:bg-clip-text">
          Overview
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
          System health, graph processing signals, and dataset movement across
          teams.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onCreateGraph}
          className="bg-primary-container hover:bg-[#6c6fed] text-white px-5 py-2.5 text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(192,193,255,0.25)] rounded-lg active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Create Graph
        </button>
      </div>
    </section>
  );
}

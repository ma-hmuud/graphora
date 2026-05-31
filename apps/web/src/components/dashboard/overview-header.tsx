"use client";

import { Plus, Sparkle } from "lucide-react";

type OverviewHeaderProps = {
  onCreateGraph: () => void;
};

export function OverviewHeader({ onCreateGraph }: OverviewHeaderProps) {
  return (
    <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-label-mono text-label-mono mb-3">
          <Sparkle className="w-3 h-3" />
          Workspace Pulse
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Overview
        </h2>
        <p className="text-on-surface-variant font-body-md text-body-md max-w-xl">
          System health, graph processing signals, and dataset movement across
          teams.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onCreateGraph}
          className="bg-inverse-primary hover:bg-primary-container text-white px-6 py-3 rounded-DEFAULT font-label-mono text-label-mono font-medium transition-colors shadow-[0_0_12px_rgba(192,193,255,0.2)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Graph
        </button>
      </div>
    </section>
  );
}

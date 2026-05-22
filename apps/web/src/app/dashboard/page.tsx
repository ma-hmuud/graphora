"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentGraphs } from "@/components/dashboard/recent-graphs";
import { DatasetTimeline } from "@/components/dashboard/dataset-timeline";
import { CreateGraphModal } from "@/components/dashboard/create-graph-modal";
import { useDashboardData } from "../../hooks/dashboard/use-dashboard-data";
import Loader from "@/components/loader";

export default function DashboardPage() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { isLoading: isDataLoading } = useDashboardData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isAuthPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader />
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

      <main className="ml-panel-width grow p-margin-desktop bg-[#0F1117]">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              Overview
            </h2>
            <p className="text-on-surface-variant font-body-md text-body-md">
              System health and graph processing metrics.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-inverse-primary hover:bg-primary-container text-white px-6 py-3 rounded-DEFAULT font-label-mono text-label-mono font-medium transition-colors shadow-[0_0_12px_rgba(192,193,255,0.2)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Graph
          </button>
        </div>

        {/* Metrics Row */}
        <StatsCards />

        {/* Main Content Area: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <RecentGraphs />
          <DatasetTimeline />
        </div>
      </main>

      <CreateGraphModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Custom Scrollbar Global Styles for Dashboard */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c0c1ff;
        }
      `}</style>
    </div>
  );
}

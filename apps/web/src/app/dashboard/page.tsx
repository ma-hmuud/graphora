"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentGraphs } from "@/components/dashboard/recent-graphs";
import { RecentDatasets } from "@/components/dashboard/recent-datasets";
import { OverviewHeader } from "@/components/dashboard/overview-header";
import { CreateGraphModal } from "@/components/dashboard/create-graph-modal";
import { useDashboardData } from "../../hooks/dashboard/use-dashboard-data";
import Loader from "@/components/loader";

export default function DashboardPage() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { stats, isLoading: isDataLoading } = useDashboardData();
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
      <main className="transition-[margin] grow duration-300">
        <div className="max-w-6xl mx-auto space-y-8">
          <OverviewHeader onCreateGraph={() => setIsModalOpen(true)} />
          <StatsCards stats={stats} isLoading={isDataLoading} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            <RecentGraphs />
            <RecentDatasets />
          </div>
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

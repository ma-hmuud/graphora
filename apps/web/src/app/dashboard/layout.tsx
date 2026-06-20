"use client";

import { AppBreadcrumb } from "@/components/dashboard/app-breadcrumb";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100">
      <Sidebar isCollapsed={isCollapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppBreadcrumb
          onToggle={() => setIsCollapsed((p) => !p)}
          collapsed={isCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0B0F19]">{children}</main>
      </div>
    </div>
  );
}

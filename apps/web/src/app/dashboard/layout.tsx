"use client";

import { AppBreadcrumb } from "@/components/dashboard/app-breadcrumb";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isCollapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppBreadcrumb
          onToggle={() => setIsCollapsed((p) => !p)}
          collapsed={isCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}

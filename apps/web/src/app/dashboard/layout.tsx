"use client";

import { AppBreadcrumb } from "@/components/dashboard/app-breadcrumb";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, SidebarInset } from "@graphora/ui/components/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50 dark:bg-[#0B0F19]">
        <AppBreadcrumb />
        <main className="flex-1 p-6 text-slate-800 dark:text-slate-100">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

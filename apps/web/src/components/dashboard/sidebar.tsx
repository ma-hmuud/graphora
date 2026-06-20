"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@graphora/ui/lib/utils";
import {
  LayoutDashboard,
  Database,
  Network,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const SIDEBAR_EXPANDED = "16rem";
const SIDEBAR_COLLAPSED = "4.5rem";

const navLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Datasets", href: "/dashboard/datasets", icon: Database },
  { name: "Graphs", href: "/dashboard/graphs", icon: Network },
];

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const user = session?.user;

  useEffect(() => {
    const width = isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
    document.documentElement.style.setProperty("--sidebar-width", width);
  }, [isCollapsed]);

  return (
    <nav
      className={cn(
        "bg-slate-50 dark:bg-[#0e1220] border-slate-200 dark:border-white/10 transition-all duration-300 flex shrink-0",
        // Mobile styles: Bottom navigation bar
        "w-full h-16 border-t flex-row items-center justify-between px-4 py-1 z-30",
        // Desktop styles: Left sidebar
        "md:h-screen md:py-6 md:sticky md:top-0 md:border-r md:flex-col md:justify-start md:px-0 md:z-10",
        isCollapsed ? "md:w-20" : "md:w-64",
      )}
    >
      {/* Header (Desktop Only) */}
      <div
        className={cn(
          "px-6 mb-10 items-center gap-4 hidden md:flex",
          isCollapsed && "px-0 justify-center",
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-[#c0c1ff]/15 dark:bg-[#c0c1ff]/10 flex items-center justify-center shrink-0 border border-[#c0c1ff]/30 dark:border-[#c0c1ff]/25 shadow-lg shadow-[#c0c1ff]/5">
          <Network className="w-6 h-6 text-inverse-primary dark:text-[#c0c1ff]" />
        </div>
        {!isCollapsed && (
          <div className="transition-all">
            <h1 className="bg-linear-to-r from-inverse-primary via-primary-container to-[#c0c1ff] dark:from-[#c0c1ff] dark:via-primary-fixed dark:to-white bg-clip-text text-xl font-bold tracking-tight text-transparent">
              Graphora
            </h1>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex flex-row items-center justify-around grow md:flex-col md:grow md:justify-start md:w-full md:space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href as any}
              className={cn(
                "flex items-center transition-all duration-300 border",
                // Mobile tab styling
                "flex-col gap-0.5 px-3 py-1 rounded-lg border-transparent",
                // Desktop sidebar styling
                "md:flex-row md:gap-3 md:px-4 md:py-3 md:rounded-xl md:mx-2 md:grow-0 md:justify-start md:w-[calc(100%-1rem)]",
                isActive
                  ? "bg-[#c0c1ff]/10 text-inverse-primary dark:text-[#c0c1ff] border-[#c0c1ff]/30 dark:border-[#c0c1ff]/25 shadow-[0_0_15px_rgba(192,193,255,0.05)] dark:shadow-[0_0_15px_rgba(192,193,255,0.1)]"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border-transparent hover:border-slate-200 dark:hover:border-white/5",
                isCollapsed && "md:justify-center md:px-0 md:mx-0 md:w-auto",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-105 shrink-0",
                  isActive
                    ? "text-inverse-primary dark:text-[#c0c1ff]"
                    : "text-slate-400 dark:text-slate-500",
                )}
              />
              <span
                className={cn(
                  "font-semibold text-[10px] tracking-wide md:text-sm",
                  isCollapsed && "md:hidden",
                )}
              >
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Footer / User Section */}
      <div className="flex flex-row items-center gap-2 px-2 shrink-0 md:flex-col md:mt-auto md:w-full md:px-2 md:space-y-2">
        <div
          className={cn(
            "flex items-center shrink-0",
            // Mobile style
            "w-9 h-9 justify-center rounded-full p-0 bg-transparent",
            // Desktop style
            "md:w-auto md:p-2 md:rounded-xl md:gap-3 md:border md:bg-slate-100 md:dark:bg-white/5 md:border-slate-200 md:dark:border-white/10",
            isCollapsed && "md:justify-center md:p-1.5",
          )}
        >
          <div className="w-8 h-8 rounded-full bg-[#c0c1ff]/15 dark:bg-[#c0c1ff]/10 flex items-center justify-center overflow-hidden border border-[#c0c1ff]/30 dark:border-[#c0c1ff]/20 shrink-0">
            {user?.image ? (
              <img
                alt={user.name}
                className="w-full h-full object-cover"
                src={user.image}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[#c0c1ff]/20 flex items-center justify-center text-inverse-primary dark:text-[#c0c1ff] font-bold text-xs">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex-1 min-w-0 hidden md:block",
              isCollapsed && "md:hidden",
            )}
          >
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate opacity-70">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center text-slate-500 dark:text-slate-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group shrink-0",
            // Mobile style
            "p-2 justify-center",
            // Desktop style
            "md:w-full md:px-4 md:py-2.5 md:gap-3",
            isCollapsed && "md:justify-center md:px-0",
          )}
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span
            className={cn(
              "text-sm font-medium hidden md:block",
              isCollapsed && "md:hidden",
            )}
          >
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
}

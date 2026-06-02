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
      className={`h-screen py-6 sticky top-0 border-r bg-background flex flex-col transition-all duration-300 ${isCollapsed ? "w-20 px-2" : "w-64"}`}
    >
      {/* Header */}
      <div
        className={cn(
          "px-6 mb-10 flex items-center gap-4",
          isCollapsed && "px-0 justify-center",
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Network className="w-6 h-6 text-on-primary" />
        </div>
        {!isCollapsed && (
          <div className="transition-all">
            <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Graphora
            </h1>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col grow space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href as any}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mx-2",
                isActive
                  ? "bg-primary text-on-primary shadow-md shadow-primary/10"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                isCollapsed && "justify-center px-0 mx-0"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-on-primary" : "text-on-surface-variant")} />
              {!isCollapsed && (
                <span className="font-medium">{link.name}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / User Section */}
      <div className="mt-auto px-2 space-y-2">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl bg-surface-container-low border border-outline-variant/30",
          isCollapsed && "justify-center p-1.5"
        )}>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 shrink-0">
            {user?.image ? (
              <img
                alt={user.name}
                className="w-full h-full object-cover"
                src={user.image}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate opacity-70">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 text-on-surface-variant px-4 py-2.5 rounded-lg hover:bg-error/10 hover:text-error transition-all duration-200 w-full group",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </nav>
  );
}

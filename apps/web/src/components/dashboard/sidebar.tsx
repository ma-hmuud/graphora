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

export function Sidebar() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        "bg-surface-container-low text-primary-fixed-dim font-label-mono text-label-mono fixed left-0 top-0 h-full z-40 flex flex-col py-6 border-r border-outline-variant transition-[width] duration-300",
        isCollapsed ? "w-18" : "w-panel-width",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-6 mb-8 flex items-center gap-4",
          isCollapsed && "px-4",
        )}
      >
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
          {user?.image ? (
            <img
              alt={user.name}
              className="w-full h-full object-cover"
              src={user.image}
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
          )}
        </div>
        <div
          className={cn(
            "transition-all",
            isCollapsed && "opacity-0 w-0 overflow-hidden",
          )}
        >
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">
            Graphora
          </h1>
          <p className="text-on-surface-variant opacity-70">
            {user?.name || "System Architect"}
          </p>
        </div>
        <button
          onClick={() => setIsCollapsed((value) => !value)}
          className={cn(
            "ml-auto text-on-surface-variant hover:text-primary transition-colors",
            isCollapsed && "ml-0",
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col grow">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-all active:translate-x-1 duration-200",
                isActive
                  ? "bg-primary/10 text-primary border-r-2 border-primary shadow-[0_0_12px_rgba(192,193,255,0.3)]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary",
              )}
            >
              <Icon className="w-5 h-5" />
              <span
                className={cn(
                  "transition-all",
                  isCollapsed && "opacity-0 w-0 overflow-hidden",
                )}
              >
                {link.name}
              </span>
            </a>
          );
        })}
      </div>

      {/* Footer Links */}
      <div className="flex flex-col mt-auto pt-6 border-t border-outline-variant/30">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high transition-all hover:text-error active:translate-x-1 duration-200 text-left w-full"
        >
          <LogOut className="w-5 h-5" />
          <span
            className={cn(
              "transition-all",
              isCollapsed && "opacity-0 w-0 overflow-hidden",
            )}
          >
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
}

"use client";

import { authClient } from "@/lib/auth-client";
import { LayoutDashboard, Database, Network, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@graphora/ui/components/sidebar";
import { cn } from "@graphora/ui/lib/utils";

const navLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Datasets", href: "/dashboard/datasets", icon: Database },
  { name: "Graphs", href: "/dashboard/graphs", icon: Network },
];

export function AppSidebar() {
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

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-14 flex items-center justify-center border-b border-sidebar-border/50 group-data-[collapsible=icon]:p-0!">
        <div className="flex items-center gap-3 w-full px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#c0c1ff]/15 dark:bg-[#c0c1ff]/10 flex items-center justify-center shrink-0 border border-[#c0c1ff]/30 dark:border-[#c0c1ff]/25 shadow-lg shadow-[#c0c1ff]/5">
            <Network className="w-5 h-5 text-inverse-primary dark:text-[#c0c1ff]" />
          </div>
          <span className="truncate font-bold tracking-tight bg-linear-to-r from-inverse-primary via-primary-container to-[#c0c1ff] dark:from-[#c0c1ff] dark:via-primary-fixed dark:to-white bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
            Graphora
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={link.name}
                      render={<Link href={link.href as any} />}
                      className={cn(
                        "transition-all duration-300 mb-2 py-4 text-sm",
                        isActive &&
                          "bg-[#c0c1ff]/10 text-inverse-primary text-sm mb-2 py-4 dark:text-[#c0c1ff] shadow-[0_0_15px_rgba(192,193,255,0.05)] dark:shadow-[0_0_15px_rgba(192,193,255,0.1)] hover:bg-[#c0c1ff]/15 dark:hover:bg-[#c0c1ff]/15 hover:text-inverse-primary dark:hover:text-[#c0c1ff]",
                      )}
                    >
                      <Icon
                        className={cn(
                          isActive &&
                            "text-inverse-primary dark:text-[#c0c1ff]",
                        )}
                      />
                      <span className={cn(isActive && "font-semibold")}>
                        {link.name}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:p-0!">
        <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 overflow-hidden rounded-xl border border-transparent group-data-[collapsible=icon]:justify-center hover:bg-sidebar-accent transition-colors">
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
          <div className="flex-1 min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
              {user?.name}
            </p>
            <p className="text-[10px] text-sidebar-foreground/70 truncate leading-tight">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-sidebar-foreground/70 hover:bg-red-500/10 hover:text-red-500 transition-colors group-data-[collapsible=icon]:hidden shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

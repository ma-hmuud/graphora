"use client";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@graphora/ui/components/breadcrumb";
import { Fragment } from "react/jsx-runtime";
import { Button } from "@graphora/ui/components/button";
import { PanelLeft } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export function AppBreadcrumb({
  onToggle,
  collapsed,
}: {
  onToggle: () => void;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="sticky top-0 z-20 w-full flex items-center justify-between h-14 px-6 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0e1220]/90 backdrop-blur-md">
      <Breadcrumb
        className="text-slate-500 dark:text-slate-400 font-medium"
        aria-label="Breadcrumb"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="shrink-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors hidden md:flex animate-none"
          >
            <PanelLeft
              className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </Button>
          <BreadcrumbList className="flex items-center gap-1.5 text-xs">
            <BreadcrumbItem>
              <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
            </BreadcrumbItem>
            {segments.map((segment, index, arr) => {
              const isLast = index === arr.length - 1;
              const href = "/" + arr.slice(0, index + 1).join("/");

              if (segment === "dashboard") {
                return null; // Skip rendering "dashboard" segment
              }

              // Capitalize segment name for display
              const displaySegment = segment.charAt(0).toUpperCase() + segment.slice(1);

              return (
                <Fragment key={href}>
                  <BreadcrumbSeparator className="opacity-40" />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-slate-800 dark:text-slate-200 font-semibold">{displaySegment}</BreadcrumbPage>
                    ) : (
                      <Link href={href as any} className="hover:text-slate-900 dark:hover:text-white transition-colors">{displaySegment}</Link>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </div>
      </Breadcrumb>
      <div className="flex items-center gap-2 shrink-0">
        <ModeToggle />
      </div>
    </div>
  );
}

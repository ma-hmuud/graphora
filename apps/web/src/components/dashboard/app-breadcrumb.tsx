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
import { SidebarTrigger } from "@graphora/ui/components/sidebar";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@graphora/ui/components/separator";

export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="sticky top-0 z-20 w-full flex items-center justify-between h-14 px-4 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0e1220]/90 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-6" />
        <Breadcrumb
          className="text-muted-foreground font-medium"
          aria-label="Breadcrumb"
        >
          <BreadcrumbList className="flex items-center gap-1.5 text-xs">
            <BreadcrumbItem>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Home</Link>
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
                      <BreadcrumbPage className="text-foreground font-semibold">{displaySegment}</BreadcrumbPage>
                    ) : (
                      <Link href={href as any} className="hover:text-foreground transition-colors">{displaySegment}</Link>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <ModeToggle />
      </div>
    </div>
  );
}

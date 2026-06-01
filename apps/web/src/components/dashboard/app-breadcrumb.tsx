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
    <Breadcrumb
      className="text-primary-fixed-dim font-label-mono sticky top-0 z-10 w-full flex items-center h-12 px-4 border-b bg-background gap-2"
      aria-label="Breadcrumb"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="shrink-0"
      >
        <PanelLeft
          className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
        />
      </Button>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link href="/dashboard">Home</Link>
        </BreadcrumbItem>
        {segments.map((segment, index, arr) => {
          const isLast = index === arr.length - 1;
          const href = "/" + arr.slice(0, index + 1).join("/");

          if (segment === "dashboard") {
            return null; // Skip rendering "dashboard" segment
          }

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segment}</BreadcrumbPage>
                ) : (
                  <Link href={href as any}>{segment}</Link>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

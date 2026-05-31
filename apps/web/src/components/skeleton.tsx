"use client";

import { cn } from "@graphora/ui/lib/utils";

export function Skeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-DEFAULT bg-surface-container-highest/60",
        className,
      )}
    />
  );
}

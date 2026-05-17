"use client";

import dynamic from "next/dynamic";

const GraphPreview = dynamic(
  () => import("@/components/graph-preview"),
  { ssr: false },
);

export default function DynamicGraphPreview() {
  return <GraphPreview />;
}

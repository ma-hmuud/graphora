"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, {
  type NodeObject,
  type LinkObject,
  type GraphData,
} from "react-force-graph-2d";

/* ---------- sample graph generation ---------- */

interface GNode {
  cluster: number;
  degree: number;
}

function generateGraph(): GraphData<GNode, object> {
  const nodes: NodeObject<GNode>[] = [];
  const links: LinkObject<GNode, object>[] = [];

  const clusterSizes = [10, 8, 7];
  let id = 0;

  clusterSizes.forEach((count, ci) => {
    for (let i = 0; i < count; i++) {
      nodes.push({ id: id++, cluster: ci, degree: 0 });
    }
  });

  const n = nodes.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (nodes[i].cluster === nodes[j].cluster && Math.random() < 0.5) {
        links.push({ source: nodes[i].id, target: nodes[j].id });
        nodes[i].degree++;
        nodes[j].degree++;
      }
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (nodes[i].cluster !== nodes[j].cluster && Math.random() < 0.05) {
        links.push({ source: nodes[i].id, target: nodes[j].id });
        nodes[i].degree++;
        nodes[j].degree++;
      }
    }
  }

  return { nodes, links };
}

const CLUSTER_COLORS = [
  "#6366F1",
  "#38BDF8",
  "#A78BFA",
];

/* ---------- component ---------- */

export default function GraphPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hovered, setHovered] = useState<NodeObject<GNode> | null>(null);

  const data = useMemo(generateGraph, []);

  const neighbours = useMemo(() => {
    if (!hovered) return new Set<number>();
    const s = new Set<number>();
    const id = hovered.id as number;
    s.add(id);
    for (const l of data.links) {
      const a =
        typeof l.source === "object"
          ? (l.source as NodeObject<GNode>).id
          : l.source;
      const b =
        typeof l.target === "object"
          ? (l.target as NodeObject<GNode>).id
          : l.target;
      if (a === id) s.add(b as number);
      if (b === id) s.add(a as number);
    }
    return s;
  }, [hovered, data.links]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    if (r.width > 0) setSize({ w: r.width, h: r.height });
    return () => ro.disconnect();
  }, []);

  const onHover = useCallback((node: NodeObject<GNode> | null) => {
    setHovered(node);
  }, []);

  const nodeColor = useCallback(
    (node: NodeObject<GNode>) => {
      if (!hovered) return CLUSTER_COLORS[node.cluster] ?? "#6366F1";
      return neighbours.has(node.id as number)
        ? CLUSTER_COLORS[node.cluster] ?? "#6366F1"
        : "rgba(255,255,255,0.08)";
    },
    [hovered, neighbours],
  );

  const nodeVal = useCallback(
    (node: NodeObject<GNode>) => {
      if (!hovered) return 1 + node.degree * 0.25;
      if (node === hovered) return 2.5 + node.degree * 0.35;
      if (neighbours.has(node.id as number)) return 1.2 + node.degree * 0.25;
      return 0.3;
    },
    [hovered, neighbours],
  );

  const linkColor = useCallback(
    (link: LinkObject<GNode, object>) => {
      const a =
        typeof link.source === "object"
          ? (link.source as NodeObject<GNode>).id
          : link.source;
      const b =
        typeof link.target === "object"
          ? (link.target as NodeObject<GNode>).id
          : link.target;
      if (!hovered) return "rgba(99,102,241,0.2)";
      const connected =
        neighbours.has(a as number) && neighbours.has(b as number);
      return connected ? "rgba(99,102,241,0.6)" : "rgba(99,102,241,0.04)";
    },
    [hovered, neighbours],
  );

  const linkWidth = useCallback(
    (link: LinkObject<GNode, object>) => {
      const a =
        typeof link.source === "object"
          ? (link.source as NodeObject<GNode>).id
          : link.source;
      const b =
        typeof link.target === "object"
          ? (link.target as NodeObject<GNode>).id
          : link.target;
      if (!hovered) return 0.4;
      return neighbours.has(a as number) && neighbours.has(b as number)
        ? 1.5
        : 0.1;
    },
    [hovered, neighbours],
  );

  return (
    <div ref={containerRef} className="w-full h-full">
      {size.w > 0 && (
        <ForceGraph2D<GNode, object>
          graphData={data}
          width={size.w}
          height={size.h}
          backgroundColor="transparent"
          nodeRelSize={5}
          nodeColor={nodeColor}
          nodeVal={nodeVal}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkDirectionalParticles={0}
          onNodeHover={onHover}
          enableNodeDrag
          cooldownTicks={120}
          nodeLabel={(node) => `Node ${node.id}  |  degree ${node.degree}`}
        />
      )}
    </div>
  );
}

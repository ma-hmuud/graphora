"use client";

import { Network, RefreshCw, AlertCircle, MoreVertical } from "lucide-react";
import { cn } from "@graphora/ui/lib/utils";

type GraphStatus = "READY" | "PROCESSING" | "FAILED";

interface Graph {
  id: string;
  name: string;
  nodes: string;
  edges: string;
  status: GraphStatus;
  statusMessage?: string;
}

const mockGraphs: Graph[] = [
  {
    id: "1",
    name: "Customer_Network_Q3",
    nodes: "2.1M",
    edges: "4.5M",
    status: "READY",
  },
  {
    id: "2",
    name: "Fraud_Detection_Beta",
    nodes: "-",
    edges: "-",
    status: "PROCESSING",
    statusMessage: "Calculating PageRank...",
  },
  {
    id: "3",
    name: "Supply_Chain_Map_Archived",
    nodes: "-",
    edges: "-",
    status: "FAILED",
    statusMessage: "Memory allocation error",
  },
  {
    id: "4",
    name: "Social_Graph_V2",
    nodes: "800K",
    edges: "1.2M",
    status: "READY",
  },
];

export function RecentGraphs() {
  return (
    <div className="lg:col-span-2 bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6 flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-headline-md text-on-surface">
          Recent Graphs
        </h3>
        <button className="text-primary hover:text-primary-fixed-dim font-label-mono text-label-mono underline underline-offset-4">
          View All
        </button>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {mockGraphs.map((graph) => (
          <div
            key={graph.id}
            className={cn(
              "bg-surface-container p-4 border transition-colors rounded-DEFAULT flex justify-between items-center group cursor-pointer",
              graph.status === "READY" && "border-outline-variant hover:border-primary/40",
              graph.status === "PROCESSING" && "border-primary/50 shadow-[0_0_8px_rgba(192,193,255,0.15)]",
              graph.status === "FAILED" && "border-outline-variant hover:border-error/40"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded border flex items-center justify-center relative",
                  graph.status === "READY" && "bg-primary/10 border-primary/30 text-primary",
                  graph.status === "PROCESSING" && "bg-primary/10 border-primary/30 text-primary",
                  graph.status === "FAILED" && "bg-error/10 border-error/30 text-error"
                )}
              >
                {graph.status === "PROCESSING" ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f39c12] rounded-full animate-ping opacity-75" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f39c12] rounded-full" />
                  </>
                ) : graph.status === "FAILED" ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Network className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4
                  className={cn(
                    "font-headline-sm text-headline-sm text-on-surface transition-colors",
                    graph.status === "READY" && "group-hover:text-primary"
                  )}
                >
                  {graph.name}
                </h4>
                <p
                  className={cn(
                    "font-label-mono text-label-mono",
                    graph.status === "FAILED" ? "text-error/80" : "text-on-surface-variant"
                  )}
                >
                  {graph.status === "READY" 
                    ? `${graph.nodes} Nodes • ${graph.edges} Edges`
                    : graph.statusMessage}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {graph.status === "READY" && (
                <span className="px-2 py-1 rounded-sm border border-[#2ecc71] text-[#2ecc71] bg-[#2ecc71]/10 font-label-mono text-[10px] uppercase tracking-wider">
                  Ready
                </span>
              )}
              {graph.status === "PROCESSING" && (
                <span className="px-2 py-1 rounded-sm border border-[#f39c12] text-[#f39c12] bg-[#f39c12]/10 font-label-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Processing
                </span>
              )}
              {graph.status === "FAILED" && (
                <span className="px-2 py-1 rounded-sm border border-error text-error bg-error/10 font-label-mono text-[10px] uppercase tracking-wider">
                  Failed
                </span>
              )}
              <button className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

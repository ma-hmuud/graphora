"use client";

import { useQuery } from "@tanstack/react-query";

// This will eventually fetch from GraphQL
export function useDashboardData() {
  const statsQuery = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      // Mock delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        totalDatasets: "1,248",
        totalGraphs: "342",
        nodesAnalyzed: "8.4M",
        edgesAnalyzed: "14.2M",
      };
    },
  });

  const graphsQuery = useQuery({
    queryKey: ["dashboard", "recent-graphs"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return []; // Return empty or mock list
    },
  });

  const timelineQuery = useQuery({
    queryKey: ["dashboard", "timeline"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      return [];
    },
  });

  return {
    stats: statsQuery.data,
    graphs: graphsQuery.data,
    timeline: timelineQuery.data,
    isLoading:
      statsQuery.isLoading || graphsQuery.isLoading || timelineQuery.isLoading,
  };
}

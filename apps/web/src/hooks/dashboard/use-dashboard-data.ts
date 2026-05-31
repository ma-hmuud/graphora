"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apolloClient } from "@/lib/apollo-client";
import { DATASETS_QUERY, GRAPHS_QUERY } from "@/lib/graphql/queries";
import type { Dataset, Graph } from "@/lib/types";

// This will eventually fetch from GraphQL
export function useDashboardData() {
  const datasetsQuery = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => {
      const { data } = await apolloClient.query<{ datasets: Dataset[] }>({
        query: DATASETS_QUERY,
        fetchPolicy: "network-only",
      });
      return data.datasets ?? [];
    },
  });

  const graphsQuery = useQuery({
    queryKey: ["graphs"],
    queryFn: async () => {
      const { data } = await apolloClient.query<{ graphs: Graph[] }>({
        query: GRAPHS_QUERY,
        fetchPolicy: "network-only",
      });
      return data.graphs ?? [];
    },
  });

  const stats = useMemo(() => {
    const datasets = datasetsQuery.data ?? [];
    const graphs = graphsQuery.data ?? [];
    const nodesAnalyzed = graphs.reduce(
      (total: number, graph) => total + (graph.nodeCount ?? 0),
      0,
    );
    const edgesAnalyzed = graphs.reduce(
      (total: number, graph) => total + (graph.edgeCount ?? 0),
      0,
    );

    return {
      totalDatasets: datasets.length,
      totalGraphs: graphs.length,
      nodesAnalyzed,
      edgesAnalyzed,
    };
  }, [datasetsQuery.data, graphsQuery.data]);

  return {
    stats,
    graphs: graphsQuery.data,
    datasets: datasetsQuery.data,
    isLoading:
      graphsQuery.isLoading || datasetsQuery.isLoading,
  };
}

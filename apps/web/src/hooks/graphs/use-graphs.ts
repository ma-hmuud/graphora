"use client";

import { useQuery } from "@tanstack/react-query";
import { apolloClient } from "@/lib/apollo-client";
import { GRAPHS_QUERY } from "@/lib/graphql/queries";

type GraphDataset = {
  id: number;
  name: string;
};

type Graph = {
  id: number;
  name: string;
  status: "PROCESSING" | "READY" | "FAILED";
  isDirected: boolean;
  isWeighted: boolean;
  nodeCount?: number | null;
  edgeCount?: number | null;
  density?: number | null;
  componentsCount?: number | null;
  shareSlug?: string | null;
  layoutPreference: "FORCE" | "CIRCULAR" | "HIERARCHICAL";
  createdAt: string;
  updatedAt: string;
  dataset: GraphDataset;
};

type GraphsResponse = {
  graphs: Graph[];
};

export function useGraphs() {
  return useQuery({
    queryKey: ["graphs"],
    queryFn: async () => {
      const { data } = await apolloClient.query<GraphsResponse>({
        query: GRAPHS_QUERY,
        fetchPolicy: "network-only",
      });
      return data.graphs;
    },
  });
}

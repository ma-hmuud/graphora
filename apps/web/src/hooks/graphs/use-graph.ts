"use client";

import { useQuery } from "@tanstack/react-query";
import { apolloClient } from "@/lib/apollo-client";
import { GRAPH_QUERY } from "@/lib/graphql/queries";

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

type GraphResponse = {
  graph: Graph;
};

export function useGraph(id: number) {
  return useQuery({
    queryKey: ["graphs", id],
    queryFn: async () => {
      const { data } = await apolloClient.query<GraphResponse>({
        query: GRAPH_QUERY,
        variables: { id },
        fetchPolicy: "network-only",
      });
      return data.graph;
    },
    enabled: Number.isFinite(id),
  });
}

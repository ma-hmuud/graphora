"use client";

import { useQuery } from "@tanstack/react-query";
import { apolloClient } from "@/lib/apollo-client";
import { GRAPH_QUERY } from "@/lib/graphql/queries";
import type { Graph } from "@/lib/types";

type GraphResponse = {
  graph: Graph;
};

export function useGraph(id: string) {
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
    enabled: !!id,
  });
}

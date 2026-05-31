"use client";

import { useQuery } from "@tanstack/react-query";
import { apolloClient } from "@/lib/apollo-client";
import { GRAPHS_QUERY } from "@/lib/graphql/queries";
import type { Graph } from "@/lib/types";

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

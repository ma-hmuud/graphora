"use client";

import { useQuery } from "@tanstack/react-query";
import { apolloClient } from "@/lib/apollo-client";
import { DATASETS_QUERY } from "@/lib/graphql/queries";
import type { Dataset } from "@/lib/types";

type DatasetsResponse = {
  datasets: Dataset[];
};

export function useDatasets() {
  return useQuery({
    queryKey: ["datasets"],
    queryFn: async () => {
      const { data } = await apolloClient.query<DatasetsResponse>({
        query: DATASETS_QUERY,
        fetchPolicy: "network-only",
      });
      return data.datasets;
    },
  });
}

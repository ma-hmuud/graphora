"use client";

import { useQuery } from "@tanstack/react-query";
import { apolloClient } from "@/lib/apollo-client";
import { DATASET_QUERY } from "@/lib/graphql/queries";
import type { Dataset } from "@/lib/types";

type DatasetResponse = {
  dataset: Dataset;
};

export function useDataset(id: number) {
  return useQuery({
    queryKey: ["datasets", id],
    queryFn: async () => {
      const { data } = await apolloClient.query<DatasetResponse>({
        query: DATASET_QUERY,
        variables: { id },
        fetchPolicy: "network-only",
      });
      return data.dataset;
    },
    enabled: Number.isFinite(id),
  });
}

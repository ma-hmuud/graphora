"use client";

import { useQuery } from "@tanstack/react-query";
import { apolloClient } from "@/lib/apollo-client";
import { DATASET_QUERY } from "@/lib/graphql/queries";

type Dataset = {
  id: number;
  name: string;
  description?: string | null;
  sizeBytes?: number | null;
  rowCount?: number | null;
  status: "PROCESSING" | "READY" | "FAILED";
  createdAt: string;
  updatedAt: string;
  fileUrl?: string | null;
};

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

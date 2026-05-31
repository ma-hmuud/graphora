"use client";

import { useQuery } from "@tanstack/react-query";
import { apolloClient } from "@/lib/apollo-client";
import { DATASETS_QUERY } from "@/lib/graphql/queries";

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

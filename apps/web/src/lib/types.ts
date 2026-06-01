export type GraphStatus = "PROCESSING" | "READY" | "FAILED";

export type Dataset = {
  id: number;
  name: string;
  description?: string | null;
  sizeBytes?: number | null;
  rowCount?: number | null;
  createdAt: string;
  updatedAt: string;
  fileUrl?: string | null;
};

export type GraphDataset = {
  id: number;
  name: string;
};

export type Graph = {
  id: number;
  name: string;
  status: GraphStatus;
  isDirected: boolean;
  isWeighted: boolean;
  nodeCount?: number | null;
  edgeCount?: number | null;
  density?: number | null;
  componentsCount?: number | null;
  shareSlug?: string | null;
  graphData?: unknown | null;
  createdAt: string;
  updatedAt: string;
  dataset: GraphDataset;
};

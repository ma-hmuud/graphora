export type GraphStatus = "PROCESSING" | "READY" | "FAILED";

export type Dataset = {
  id: string;
  name: string;
  description?: string | null;
  sizeBytes?: number | null;
  rowCount?: number | null;
  createdAt: string;
  updatedAt: string;
  fileUrl?: string | null;
};

export type GraphDataset = {
  id: string;
  name: string;
};

export type Graph = {
  id: string;
  name: string;
  status: GraphStatus;
  sourceColumn?: string | null;
  targetColumn?: string | null;
  errorMessage?: string | null;
  isDirected: boolean;
  isWeighted: boolean;
  nodeCount?: number | null;
  edgeCount?: number | null;
  density?: number | null;
  componentsCount?: number | null;
  communitiesCount?: number | null;
  averageDegree?: number | null;
  diameter?: number | null;
  clusteringCoefficient?: number | null;
  shareSlug?: string | null;
  graphData?: unknown | null;
  createdAt: string;
  updatedAt: string;
  dataset: GraphDataset;
};

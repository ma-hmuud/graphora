import z from "zod";

export const createGraphSchema = z.object({
  name: z.string().min(1).max(100),
  datasetId: z.string().min(1),
  sourceColumn: z.string().min(1).optional(),
  targetColumn: z.string().min(1).optional(),
  isDirected: z.boolean().optional(),
  isWeighted: z.boolean().optional(),
});

export const updateGraphSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(["PROCESSING", "READY", "FAILED"]).optional(),
  isDirected: z.boolean().optional(),
  isWeighted: z.boolean().optional(),
  shareSlug: z.string().max(120).optional(),
});

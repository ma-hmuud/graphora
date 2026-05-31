import z from "zod";

export const createGraphSchema = z.object({
  name: z.string().min(1).max(100),
  datasetId: z.number().int().positive(),
  isDirected: z.boolean().optional(),
  isWeighted: z.boolean().optional(),
  layoutPreference: z.enum(["FORCE", "CIRCULAR", "HIERARCHICAL"]).optional(),
});

export const updateGraphSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(["PROCESSING", "READY", "FAILED"]).optional(),
  isDirected: z.boolean().optional(),
  isWeighted: z.boolean().optional(),
  layoutPreference: z.enum(["FORCE", "CIRCULAR", "HIERARCHICAL"]).optional(),
  shareSlug: z.string().max(120).optional(),
});

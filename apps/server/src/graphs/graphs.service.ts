import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { prisma } from "@graphora/db";
import { Queue } from "bullmq";
import { env } from "@graphora/env/server";
import { DatasetsService } from "../datasets/datasets.service.js";

interface CreateGraphInput {
  name: string;
  datasetId: number;
  isDirected?: boolean | null;
  isWeighted?: boolean | null;
  layoutPreference?: "FORCE" | "CIRCULAR" | "HIERARCHICAL" | null;
}

interface UpdateGraphInput {
  name?: string | null;
  status?: "PROCESSING" | "READY" | "FAILED" | null;
  isDirected?: boolean | null;
  isWeighted?: boolean | null;
  layoutPreference?: "FORCE" | "CIRCULAR" | "HIERARCHICAL" | null;
  shareSlug?: string | null;
}

@Injectable()
export class GraphsService {
  private readonly graphsQueue: Queue;

  constructor(private readonly datasets: DatasetsService) {
    this.graphsQueue = new Queue("graph-analysis", {
      connection: {
        username: env.REDIS_USERNAME,
        password: env.REDIS_PASSWORD,
        host: env.REDIS_HOST,
        port: Number(env.REDIS_PORT),
      },
    });
  }
  async listGraphs(userId: number) {
    return prisma.graph.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { dataset: true },
    });
  }

  async getGraph(userId: number, id: number) {
    const graph = await prisma.graph.findFirst({
      where: { id, userId },
      include: { dataset: true },
    });

    if (!graph) throw new NotFoundException("Graph not found");
    return graph;
  }

  async createGraph(userId: number, input: CreateGraphInput) {
    const dataset = await prisma.dataset.findFirst({
      where: { id: input.datasetId, userId },
    });

    if (!dataset) throw new NotFoundException("Dataset not found");

    const graph = await prisma.graph.create({
      data: {
        name: input.name,
        datasetId: input.datasetId,
        userId,
        isDirected: input.isDirected ?? true,
        isWeighted: input.isWeighted ?? false,
        layoutPreference: input.layoutPreference ?? "FORCE",
      },
      include: { dataset: true },
    });

    const fileUrl = await this.datasets.getDatasetFileUrl(userId, dataset.id);
    await this.graphsQueue.add("process", {
      graphId: graph.id,
      fileUrl,
    });

    return graph;
  }

  async regenerateGraph(userId: number, id: number) {
    const graph = await prisma.graph.findFirst({
      where: { id, userId },
      include: { dataset: true },
    });

    if (!graph) throw new NotFoundException("Graph not found");

    const fileUrl = await this.datasets.getDatasetFileUrl(
      userId,
      graph.dataset.id,
    );
    await prisma.graph.update({
      where: { id: graph.id },
      data: { status: "PROCESSING" },
    });

    await this.graphsQueue.add("process", {
      graphId: graph.id,
      fileUrl,
    });

    return graph;
  }

  async updateGraph(userId: number, id: number, input: UpdateGraphInput) {
    const graph = await prisma.graph.findFirst({
      where: { id, userId },
    });

    if (!graph) throw new NotFoundException("Graph not found");

    if (input.shareSlug) {
      const slugExists = await prisma.graph.findFirst({
        where: { shareSlug: input.shareSlug, id: { not: id } },
      });
      if (slugExists) {
        throw new BadRequestException("Share slug already exists");
      }
    }

    return prisma.graph.update({
      where: { id: graph.id },
      data: {
        name: input.name ?? undefined,
        status: input.status ?? undefined,
        isDirected: input.isDirected ?? undefined,
        isWeighted: input.isWeighted ?? undefined,
        layoutPreference: input.layoutPreference ?? undefined,
        shareSlug: input.shareSlug ?? undefined,
      },
      include: { dataset: true },
    });
  }

  async deleteGraph(userId: number, id: number) {
    const graph = await prisma.graph.findFirst({
      where: { id, userId },
    });

    if (!graph) throw new NotFoundException("Graph not found");

    await prisma.graph.delete({ where: { id: graph.id } });
    return true;
  }

  async updateGraphFromWorker(input: {
    graphId: number;
    status: "PROCESSING" | "READY" | "FAILED";
    errorMessage?: string | null;
    nodeCount?: number | null;
    edgeCount?: number | null;
    isDirected?: boolean | null;
    isWeighted?: boolean | null;
    density?: number | null;
    componentsCount?: number | null;
    graphData?: unknown;
  }) {
    return prisma.graph.update({
      where: { id: input.graphId },
      data: {
        status: input.status,
        errorMessage: input.errorMessage ?? undefined,
        nodeCount: input.nodeCount ?? undefined,
        edgeCount: input.edgeCount ?? undefined,
        isDirected: input.isDirected ?? undefined,
        isWeighted: input.isWeighted ?? undefined,
        density: input.density ?? undefined,
        componentsCount: input.componentsCount ?? undefined,
        graphData: input.graphData ?? undefined,
      },
    });
  }
}

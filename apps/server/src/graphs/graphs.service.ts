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
  sourceColumn?: string | null;
  targetColumn?: string | null;
  isDirected?: boolean | null;
  isWeighted?: boolean | null;
}

interface UpdateGraphInput {
  name?: string | null;
  status?: "PROCESSING" | "READY" | "FAILED" | null;
  sourceColumn?: string | null;
  targetColumn?: string | null;
  isDirected?: boolean | null;
  isWeighted?: boolean | null;
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
        sourceColumn: input.sourceColumn,
        targetColumn: input.targetColumn,
        isDirected: input.isDirected ?? true,
        isWeighted: input.isWeighted ?? false,
      },
      include: { dataset: true },
    });

    const fileUrl = await this.datasets.getDatasetFileUrl(userId, dataset.id);
    await this.graphsQueue.add("process", {
      graphId: graph.id,
      fileUrl,
      sourceColumn: graph.sourceColumn,
      targetColumn: graph.targetColumn,
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
      sourceColumn: graph.sourceColumn,
      targetColumn: graph.targetColumn,
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
        sourceColumn: input.sourceColumn ?? undefined,
        targetColumn: input.targetColumn ?? undefined,
        isDirected: input.isDirected ?? undefined,
        isWeighted: input.isWeighted ?? undefined,
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
    communitiesCount?: number | null;
    averageDegree?: number | null;
    diameter?: number | null;
    clusteringCoefficient?: number | null;
    graphData?: unknown;
  }) {
    try {
      return await prisma.graph.update({
        where: { id: input.graphId },
        data: {
          status: input.status,
          errorMessage: input.errorMessage ? input.errorMessage.substring(0, 499) : undefined,
          nodeCount: input.nodeCount ?? undefined,
          edgeCount: input.edgeCount ?? undefined,
          isDirected: input.isDirected ?? undefined,
          isWeighted: input.isWeighted ?? undefined,
          density: input.density ?? undefined,
          componentsCount: input.componentsCount ?? undefined,
          communitiesCount: input.communitiesCount ?? undefined,
          averageDegree: input.averageDegree ?? undefined,
          diameter: input.diameter ?? undefined,
          clusteringCoefficient: input.clusteringCoefficient ?? undefined,
          graphData: input.graphData ?? undefined,
        },
      });
    } catch (error) {
      console.error(`[GraphsService] Error updating graph ${input.graphId} from worker:`, error);
      throw error;
    }
  }
}

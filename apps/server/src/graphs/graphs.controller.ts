import { Body, Controller, Post, BadRequestException } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { GraphsService } from "./graphs.service.js";

type WorkerPayload = {
  graphId: number;
  status: "PROCESSING" | "READY" | "FAILED";
  errorMessage?: string | null;
  metrics?: {
    nodeCount?: number | null;
    edgeCount?: number | null;
    isDirected?: boolean | null;
    isWeighted?: boolean | null;
    density?: number | null;
    componentsCount?: number | null;
  };
  graphData?: unknown;
};

@Controller("internal/graphs")
export class GraphsController {
  constructor(private readonly graphs: GraphsService) {}

  @AllowAnonymous()
  @Post("complete")
  async complete(@Body() payload: WorkerPayload) {
    if (!payload?.graphId || !payload?.status) {
      throw new BadRequestException("Missing graphId or status");
    }

    await this.graphs.updateGraphFromWorker({
      graphId: payload.graphId,
      status: payload.status,
      errorMessage: payload.errorMessage ?? undefined,
      nodeCount: payload.metrics?.nodeCount ?? undefined,
      edgeCount: payload.metrics?.edgeCount ?? undefined,
      isDirected: payload.metrics?.isDirected ?? undefined,
      isWeighted: payload.metrics?.isWeighted ?? undefined,
      density: payload.metrics?.density ?? undefined,
      componentsCount: payload.metrics?.componentsCount ?? undefined,
      graphData: payload.graphData ?? undefined,
    });

    return { ok: true };
  }
}

import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ZodValidationPipe } from "../pipes/zod.pipe.js";
import { createGraphSchema, updateGraphSchema } from "./graphs.schema.js";
import { GraphsService } from "./graphs.service.js";

@Resolver()
export class GraphsResolver {
  constructor(private readonly graphs: GraphsService) {}

  @Query("graphs")
  async graphsList(@Session() session: UserSession) {
    return this.graphs.listGraphs(Number(session.user.id));
  }

  @Query("graph")
  async graphById(
    @Args("id", { type: () => Int }) id: number,
    @Session() session: UserSession,
  ) {
    return this.graphs.getGraph(Number(session.user.id), id);
  }

  @Mutation("createGraph")
  async createGraph(
    @Args("input", new ZodValidationPipe(createGraphSchema))
    input: {
      name: string;
      datasetId: number;
      isDirected?: boolean;
      isWeighted?: boolean;
      layoutPreference?: "FORCE" | "CIRCULAR" | "HIERARCHICAL";
    },
    @Session() session: UserSession,
  ) {
    return this.graphs.createGraph(Number(session.user.id), input);
  }

  @Mutation("updateGraph")
  async updateGraph(
    @Args("id", { type: () => Int }) id: number,
    @Args("input", new ZodValidationPipe(updateGraphSchema))
    input: {
      name?: string;
      status?: "PROCESSING" | "READY" | "FAILED";
      isDirected?: boolean;
      isWeighted?: boolean;
      layoutPreference?: "FORCE" | "CIRCULAR" | "HIERARCHICAL";
      shareSlug?: string;
    },
    @Session() session: UserSession,
  ) {
    return this.graphs.updateGraph(Number(session.user.id), id, input);
  }

  @Mutation("deleteGraph")
  async deleteGraph(
    @Args("id", { type: () => Int }) id: number,
    @Session() session: UserSession,
  ) {
    return this.graphs.deleteGraph(Number(session.user.id), id);
  }
}

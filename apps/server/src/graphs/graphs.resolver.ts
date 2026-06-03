import {
  Args,
  Mutation,
  Query,
  Resolver,
  ResolveField,
  Parent,
} from "@nestjs/graphql";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ZodValidationPipe } from "../pipes/zod.pipe.js";
import { createGraphSchema, updateGraphSchema } from "./graphs.schema.js";
import { GraphsService } from "./graphs.service.js";
import { decodeId, encodeId } from "../lib/hashids.js";

@Resolver("Graph")
export class GraphsResolver {
  constructor(private readonly graphs: GraphsService) {}

  @Query("graphs")
  async graphsList(@Session() session: UserSession) {
    return this.graphs.listGraphs(Number(session.user.id));
  }

  @Query("graph")
  async graphById(@Args("id") id: string, @Session() session: UserSession) {
    return this.graphs.getGraph(Number(session.user.id), decodeId(id));
  }

  @ResolveField("id")
  id(@Parent() graph: { id: number }) {
    return encodeId(graph.id);
  }

  @Mutation("createGraph")
  async createGraph(
    @Args("input", new ZodValidationPipe(createGraphSchema))
    input: {
      name: string;
      datasetId: string;
      sourceColumn?: string;
      targetColumn?: string;
      isDirected?: boolean;
      isWeighted?: boolean;
    },
    @Session() session: UserSession,
  ) {
    return this.graphs.createGraph(Number(session.user.id), {
      ...input,
      datasetId: decodeId(input.datasetId),
    });
  }

  @Mutation("updateGraph")
  async updateGraph(
    @Args("id") id: string,
    @Args("input", new ZodValidationPipe(updateGraphSchema))
    input: {
      name?: string;
      status?: "PROCESSING" | "READY" | "FAILED";
      isDirected?: boolean;
      isWeighted?: boolean;
      shareSlug?: string;
    },
    @Session() session: UserSession,
  ) {
    return this.graphs.updateGraph(
      Number(session.user.id),
      decodeId(id),
      input,
    );
  }

  @Mutation("deleteGraph")
  async deleteGraph(@Args("id") id: string, @Session() session: UserSession) {
    return this.graphs.deleteGraph(Number(session.user.id), decodeId(id));
  }

  @Mutation("regenerateGraph")
  async regenerateGraph(
    @Args("id") id: string,
    @Session() session: UserSession,
  ) {
    return this.graphs.regenerateGraph(Number(session.user.id), decodeId(id));
  }
}

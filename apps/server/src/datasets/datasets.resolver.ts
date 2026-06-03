import { Args, Mutation, Query, Resolver, ResolveField, Parent } from "@nestjs/graphql";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ZodValidationPipe } from "../pipes/zod.pipe.js";
import { createDatasetSchema, updateDatasetSchema } from "./datasets.schema.js";
import { DatasetsService } from "./datasets.service.js";
import { GraphQLUpload, type FileUpload } from "graphql-upload-minimal";
import { BadRequestException } from "@nestjs/common";
import { decodeId, encodeId } from "../lib/hashids.js";

@Resolver("Dataset")
export class DatasetsResolver {
  constructor(private readonly datasets: DatasetsService) {}

  @Query("datasets")
  async datasetsList(@Session() session: UserSession) {
    const datasets = await this.datasets.listDatasets(Number(session.user.id));
    return Promise.all(
      datasets.map(async (dataset) =>
        withFileUrl(this.datasets, Number(session.user.id), dataset),
      ),
    );
  }

  @Query("dataset")
  async datasetById(
    @Args("id") id: string,
    @Session() session: UserSession,
  ) {
    const dataset = await this.datasets.getDataset(
      Number(session.user.id),
      decodeId(id),
    );
    return withFileUrl(this.datasets, Number(session.user.id), dataset);
  }

  @Query("datasetHeaders")
  async datasetHeaders(
    @Args("id") id: string,
    @Session() session: UserSession,
  ) {
    return this.datasets.getDatasetHeaders(
      Number(session.user.id),
      decodeId(id),
    );
  }

  @ResolveField("id")
  id(@Parent() dataset: { id: number }) {
    return encodeId(dataset.id);
  }

  @Mutation("createDataset")
  async createDataset(
    @Args("input", new ZodValidationPipe(createDatasetSchema))
    input: { name: string; description?: string },
    @Args({ name: "file", type: () => GraphQLUpload })
    file: Promise<FileUpload>,
    @Session() session: UserSession,
  ) {
    const upload = await file;
    if (!upload) throw new BadRequestException("File is required");

    const buffer = await uploadToBuffer(upload);

    const dataset = await this.datasets.createDataset(
      Number(session.user.id),
      input,
      {
        buffer,
        mimetype: upload.mimetype,
        size: buffer.length,
      },
    );

    return withFileUrl(this.datasets, Number(session.user.id), dataset);
  }

  @Mutation("updateDataset")
  async updateDataset(
    @Args("id") id: string,
    @Args("input", new ZodValidationPipe(updateDatasetSchema))
    input: { name?: string; description?: string },
    @Session() session: UserSession,
  ) {
    const dataset = await this.datasets.updateDataset(
      Number(session.user.id),
      decodeId(id),
      input,
    );
    return withFileUrl(this.datasets, Number(session.user.id), dataset);
  }

  @Mutation("deleteDataset")
  async deleteDataset(
    @Args("id") id: string,
    @Session() session: UserSession,
  ) {
    return this.datasets.deleteDataset(Number(session.user.id), decodeId(id));
  }
}

async function uploadToBuffer(file: FileUpload): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    file
      .createReadStream()
      .on("data", (chunk) => chunks.push(chunk as Buffer))
      .on("error", (error) => reject(error))
      .on("end", () => resolve(Buffer.concat(chunks)));
  });
}

async function withFileUrl(
  datasets: DatasetsService,
  userId: number,
  dataset: { id: number },
) {
  return {
    ...dataset,
    fileUrl: await datasets.getDatasetFileUrl(userId, dataset.id),
  };
}

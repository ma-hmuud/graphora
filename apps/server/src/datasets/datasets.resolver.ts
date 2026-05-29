import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ZodValidationPipe } from "../pipes/zod.pipe.js";
import { createDatasetSchema, updateDatasetSchema } from "./datasets.schema.js";
import { DatasetsService } from "./datasets.service.js";
import { GraphQLUpload, type FileUpload } from "graphql-upload-minimal";
import { BadRequestException } from "@nestjs/common";

@Resolver()
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
    @Args("id", { type: () => Int }) id: number,
    @Args("input", new ZodValidationPipe(updateDatasetSchema))
    input: { name?: string; description?: string },
    @Session() session: UserSession,
  ) {
    const dataset = await this.datasets.updateDataset(
      Number(session.user.id),
      id,
      input,
    );
    return withFileUrl(this.datasets, Number(session.user.id), dataset);
  }

  @Mutation("deleteDataset")
  async deleteDataset(
    @Args("id", { type: () => Int }) id: number,
    @Session() session: UserSession,
  ) {
    return this.datasets.deleteDataset(Number(session.user.id), id);
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

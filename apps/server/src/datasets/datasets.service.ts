import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { prisma } from "@graphora/db";
import { S3Service } from "../s3/s3.service.js";
import { tryCatch } from "../lib/try-catch.js";
import { console } from "inspector/promises";

interface CreateDatasetInput {
  name: string;
  description?: string | null;
}

interface UpdateDatasetInput {
  name?: string | null;
  description?: string | null;
}

@Injectable()
export class DatasetsService {
  constructor(private readonly s3: S3Service) {}

  async createDataset(
    userId: number,
    input: CreateDatasetInput,
    file: {
      buffer: Buffer;
      mimetype: string;
      size?: number;
    },
  ) {
    const { data: key, error: uploadError } = await tryCatch(
      this.s3.upload(file.buffer, file.mimetype, "datasets"),
    );

    if (uploadError) {
      console.error("S3 upload error:", uploadError);
      throw new BadRequestException("Failed to upload dataset file");
    }

    const { data: dataset, error: createError } = await tryCatch(
      prisma.dataset.create({
        data: {
          name: input.name,
          description: input.description ?? null,
          s3Key: key,
          sizeBytes: file.size ?? null,
          userId,
        },
      }),
    );

    if (createError) {
      await this.s3.delete(key).catch(() => undefined);
      throw new BadRequestException("Failed to save dataset");
    }

    return dataset;
  }

  async listDatasets(userId: number) {
    return prisma.dataset.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateDataset(userId: number, id: number, input: UpdateDatasetInput) {
    const dataset = await prisma.dataset.findFirst({
      where: { id, userId },
    });

    if (!dataset) throw new NotFoundException("Dataset not found");

    return prisma.dataset.update({
      where: { id: dataset.id },
      data: {
        name: input.name ?? undefined,
        description: input.description ?? undefined,
      },
    });
  }

  async deleteDataset(userId: number, id: number) {
    const dataset = await prisma.dataset.findFirst({
      where: { id, userId },
    });

    if (!dataset) throw new NotFoundException("Dataset not found");

    await prisma.dataset.delete({ where: { id: dataset.id } });
    await this.s3.delete(dataset.s3Key).catch(() => undefined);
    return true;
  }

  async getDatasetFileUrl(userId: number, id: number) {
    const dataset = await prisma.dataset.findFirst({
      where: { id, userId },
    });

    if (!dataset) throw new NotFoundException("Dataset not found");

    return this.s3.getSignedUrl(dataset.s3Key);
  }
}

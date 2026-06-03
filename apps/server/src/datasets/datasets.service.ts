import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { prisma } from "@graphora/db";
import { S3Service } from "../s3/s3.service.js";
import { tryCatch } from "../lib/try-catch.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@graphora/env/server";

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

  async getDataset(userId: number, id: number) {
    const dataset = await prisma.dataset.findFirst({
      where: { id, userId },
    });

    if (!dataset) throw new NotFoundException("Dataset not found");
    return dataset;
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

  async getDatasetHeaders(userId: number, id: number): Promise<string[]> {
    const dataset = await this.getDataset(userId, id);

    console.log(`[DatasetsService] Fetching headers for dataset ${id} (${dataset.s3Key})...`);

    try {
      const command = new GetObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: dataset.s3Key,
        Range: "bytes=0-4096",
      });

      const response = await this.s3.getClient().send(command);
      
      if (!response.Body) {
        console.warn(`[DatasetsService] Empty body for ${dataset.s3Key}`);
        return [];
      }

      // Robust stream reading
      const chunks: Buffer[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(Buffer.from(chunk));
      }
      const body = Buffer.concat(chunks).toString("utf-8");

      if (!body) {
        console.warn(`[DatasetsService] Could not read body for ${dataset.s3Key}`);
        return [];
      }

      // Get first line and handle both \n and \r\n
      const firstLine = (body.split(/\r?\n/)[0] ?? "").trim();
      console.log(`[DatasetsService] Raw header line: "${firstLine}"`);

      if (!firstLine) return [];

      // Improved delimiter detection
      let delimiter = ",";
      const commaCount = (firstLine.match(/,/g) || []).length;
      const tabCount = (firstLine.match(/\t/g) || []).length;
      const semiCount = (firstLine.match(/;/g) || []).length;

      if (tabCount > commaCount && tabCount > semiCount) delimiter = "\t";
      else if (semiCount > commaCount && semiCount > tabCount) delimiter = ";";

      console.log(`[DatasetsService] Detected delimiter: '${delimiter}'`);

      const headers = firstLine
        .split(delimiter)
        .map((h) => h.trim().replace(/^"|"$/g, "")) // Remove quotes
        .filter((h) => h.length > 0); // Remove empty headers

      console.log(`[DatasetsService] Parsed headers for dataset ${id}:`, headers);
      return headers;
    } catch (error: any) {
      console.error(`[DatasetsService] Error fetching headers for dataset ${id}:`, error);
      throw new Error(`Failed to fetch headers: ${error.message}`);
    }
  }
}

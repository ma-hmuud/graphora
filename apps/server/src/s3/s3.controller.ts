import { Controller, Post, Req } from "@nestjs/common";
import { type FastifyRequest } from "fastify";
import { S3Service } from "./s3.service";

@Controller("files")
export class S3Controller {
  constructor(private readonly s3: S3Service) {}

  @Post("upload")
  async upload(@Req() req: FastifyRequest) {
    const data = await req.file();
    if (!data) throw new Error("No file uploaded");

    const buffer = await data.toBuffer();
    const key = await this.s3.upload(buffer, data.mimetype);

    return { key };
  }
}

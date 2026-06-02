import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";
import multipart from "@fastify/multipart";
import { processRequest } from "graphql-upload-minimal";

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      trustProxy: true, // Trust Fly.io's reverse proxy
    }),
    { bodyParser: false },
  );

  await app.register(multipart as any, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB,
    },
  });

  const fastify = app.getHttpAdapter().getInstance();

  fastify.addHook("preValidation", async (request, reply) => {
    if (request.headers["content-type"]?.includes("multipart/form-data")) {
      request.body = await processRequest(request.raw, reply.raw);
    }
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, "0.0.0.0");
  console.log(`Server running on port ${port}`);
}

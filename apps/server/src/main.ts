import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { env } from "@graphora/env/server";
import { AppModule } from "./app.module.js";

const baseCorsConfig = {
  origin: env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
};

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    { bodyParser: false }
  );

  app.enableCors(baseCorsConfig);

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, "0.0.0.0");
  console.log(`Server running on port ${port}`);
}

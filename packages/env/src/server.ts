import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.string(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_REDIRECT_URI: z.string().min(1),
    EMAIL_API_KEY: z.string(),
    EMAIL_VERIFICATION_TEMPLATE_ID: z.string(),
    EMAIL_USER: z.string(),
    AWS_ACCESS_KEY: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_REGION: z.string().min(1),
    AWS_S3_BUCKET: z.string().min(1),
    AWS_S3_ENDPOINT: z.string().url().optional(),
    REDIS_USERNAME: z.string().min(1),
    REDIS_PASSWORD: z.string().min(1),
    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

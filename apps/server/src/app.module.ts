import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { MercuriusDriver } from "@nestjs/mercurius";
import type { MercuriusDriverConfig } from "@nestjs/mercurius";
import { AppResolver } from "./app.resolver.js";
import { join } from "node:path";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "@graphora/auth";
import { AuthResolver } from "./auth/auth.resolver.js";
import { S3Module } from "./s3/s3.module.js";
import { DatasetsResolver } from "./datasets/datasets.resolver.js";
import { DatasetsService } from "./datasets/datasets.service.js";
import { GraphsResolver } from "./graphs/graphs.resolver.js";
import { GraphsService } from "./graphs/graphs.service.js";
import { GraphsController } from "./graphs/graphs.controller.js";
import { GraphQLUpload } from "graphql-upload-minimal";
import { GraphQLJSON } from "graphql-type-json";

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      typePaths: ["./**/*.graphql"],
      definitions: {
        path: join(process.cwd(), "src/graphql.ts"),
      },
      resolvers: { Upload: GraphQLUpload, JSON: GraphQLJSON },
    }),
    AuthModule.forRoot({ auth }),
    S3Module,
  ],
  controllers: [GraphsController],
  providers: [
    AppResolver,
    AuthResolver,
    DatasetsResolver,
    DatasetsService,
    GraphsResolver,
    GraphsService,
  ],
})
export class AppModule {}

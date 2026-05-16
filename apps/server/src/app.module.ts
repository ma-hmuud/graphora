import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { MercuriusDriver } from "@nestjs/mercurius";
import type { MercuriusDriverConfig } from "@nestjs/mercurius";
import { AppResolver } from "./app.resolver.js";
import { join } from "node:path";

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      typePaths: ["./**/*.graphql"],
      definitions: {
        path: join(process.cwd(), "src/graphql.ts"),
        outputAs: "class",
      },
    }),
  ],
  providers: [AppResolver],
})
export class AppModule {}

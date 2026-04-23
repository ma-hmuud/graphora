import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { MercuriusDriver } from "@nestjs/mercurius";
import type { MercuriusDriverConfig } from "@nestjs/mercurius";
import { AppController } from "./app.controller.js";
import { AppResolver } from "./app.resolver.js";

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      autoSchemaFile: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppResolver],
})
export class AppModule {}

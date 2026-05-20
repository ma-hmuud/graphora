import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { MercuriusDriver } from "@nestjs/mercurius";
import type { MercuriusDriverConfig } from "@nestjs/mercurius";
import { AppResolver } from "./app.resolver.js";
import { join } from "node:path";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "@graphora/auth";
import { AuthResolver } from "./auth/auth.resolver.js";

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      typePaths: ["./**/*.graphql"],
      definitions: {
        path: join(process.cwd(), "src/graphql.ts"),
      },
    }),
    AuthModule.forRoot({ auth }),
  ],
  providers: [AppResolver, AuthResolver],
})
export class AppModule {}

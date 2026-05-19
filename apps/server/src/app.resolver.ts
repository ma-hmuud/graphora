import { Args, Query, Resolver } from "@nestjs/graphql";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Resolver()
export class AppResolver {
  @AllowAnonymous()
  @Query("hello")
  hello(@Args("name") name: string): string {
    return `Hello, ${name}`;
  }
}

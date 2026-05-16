import { Args, Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class AppResolver {
  @Query('hello')
  hello(@Args('name') name: string): string {
    return `Hello, ${name}`;
  }
}

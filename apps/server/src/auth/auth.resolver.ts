import { Parent, ResolveField, Query, Resolver } from "@nestjs/graphql";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { encodeId } from "../lib/hashids.js";

@Resolver("User")
export class AuthResolver {
  @Query("me")
  async me(@Session() session: UserSession) {
    return session.user;
  }

  @ResolveField("id")
  id(@Parent() user: { id: number | string }) {
    return encodeId(Number(user.id));
  }
}

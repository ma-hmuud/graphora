import { Query, Resolver } from "@nestjs/graphql";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";

@Resolver()
export class AuthResolver {
  @Query("me")
  async me(@Session() session: UserSession) {
    return session.user;
  }
}

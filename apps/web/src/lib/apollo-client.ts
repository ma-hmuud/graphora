"use client";

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { env } from "@graphora/env/web";

const httpLink = createHttpLink({
  uri: `${env.NEXT_PUBLIC_SERVER_URL}/graphql`,
  credentials: "include",
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

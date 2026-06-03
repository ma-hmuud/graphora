"use client";

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { env } from "@graphora/env/web";

const httpLink = createHttpLink({
  // Use relative path to leverage Vercel rewrites
  // This ensures the browser sends the session cookies set on the Vercel domain
  uri: "/graphql",
  credentials: "include",
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

import { env } from "@graphora/env/web";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Point exactly to the auth endpoints on your server
  baseURL: `${env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "")}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
  // Required for cross-domain auth (vercel.app vs fly.dev)
  disableCookieCache: true,
});

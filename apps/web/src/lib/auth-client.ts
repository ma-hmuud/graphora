import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Use current origin to leverage Vercel rewrites (/api/auth -> Fly.io)
  // This makes auth cookies First-Party and fixes state_mismatch
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
  fetchOptions: {
    credentials: "include",
  },
  // Required for cross-domain auth if not using same domain, 
  // but with rewrites we are effectively on the same domain.
  disableCookieCache: true,
});

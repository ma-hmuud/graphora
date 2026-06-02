import { prisma } from "@graphora/db";
import { env } from "@graphora/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendEmail } from "./lib/mail-sender";

const cors = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

// Better Auth requires the baseURL to point exactly to the auth endpoints path
const authBaseURL = env.BETTER_AUTH_URL.endsWith("/api/auth")
  ? env.BETTER_AUTH_URL
  : `${env.BETTER_AUTH_URL.replace(/\/$/, "")}/api/auth`;

const isProd =
  !authBaseURL.includes("localhost") && !authBaseURL.includes("127.0.0.1");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    database: {
      generateId: "serial",
    },
    // Required for Fly.io/Vercel/Cloudflare to trust HTTPS through the proxy
    useSecureCookies: isProd,
  },
  trustedOrigins: cors,
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail(user.email, url);
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      // Explicitly matching the Google Console URI
      redirectURI: `${authBaseURL}/callback/google`,
      prompt: "select_account",
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: authBaseURL,
});

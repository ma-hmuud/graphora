import { prisma } from "@graphora/db";
import { env } from "@graphora/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendEmail } from "./lib/mail-sender";

const cors = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

// For production cross-domain (Vercel + Fly.io), baseURL MUST include the /api/auth path
const authBaseURL = env.BETTER_AUTH_URL.endsWith("/api/auth")
  ? env.BETTER_AUTH_URL
  : `${env.BETTER_AUTH_URL.replace(/\/$/, "")}/api/auth`;

const isProd = env.NODE_ENV === "production" || (!authBaseURL.includes("localhost") && !authBaseURL.includes("127.0.0.1"));

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Mandatory for different domains (vercel.app vs fly.dev)
  // Even with rewrites, we want secure cookies in production
  useSecureCookies: isProd,

  advanced: {
    database: {
      generateId: "serial",
    },
    // Required for Fly.io and other reverse proxies
    proxy: true,
    defaultCookieAttributes: isProd ? {
      sameSite: "lax", // 'lax' is sufficient with rewrites because it's now First-Party
      secure: true,
      httpOnly: true,
      path: "/",
    } : undefined,
  },

  // Explicitly trust your frontend URL
  trustedOrigins: [
    ...cors,
    "https://graphora-visualizer.vercel.app"
  ],

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
      prompt: "select_account",
    },
  },

  secret: env.BETTER_AUTH_SECRET,
  baseURL: authBaseURL,
});

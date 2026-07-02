import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  trustedOrigins: [
    "http://localhost:3000",   // Next.js frontend
    "http://localhost:3001",   // NestJS backend (for some calls)
  ],
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set true in production
  },
  secret: process.env.BETTER_AUTH_SECRET,
  // Add more later: social providers, etc.
});
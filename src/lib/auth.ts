import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { nextCookies } from "better-auth/next-js";
import { sendPasswordResetEmail, sendVerificationEmail } from "./email";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationEmail(user.email, url);
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [nextCookies()],
});

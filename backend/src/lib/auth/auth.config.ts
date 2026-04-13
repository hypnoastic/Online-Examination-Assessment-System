import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { routes } from "../routes";
import { InactiveAccountError } from "./errors";
import { validateCredentials } from "../../modules/auth/service";
import type { AppRole } from "../../modules/auth/types";

export const authConfig = {
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "oeas-dev-secret",
  pages: {
    signIn: routes.login,
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Institutional email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const result = await validateCredentials(email, password);

        if (!result.success) {
          if (result.reason === "inactive_account") {
            throw new InactiveAccountError();
          }

          return null;
        }

        return result.user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as AppRole;
        session.user.isActive = Boolean(token.isActive);
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

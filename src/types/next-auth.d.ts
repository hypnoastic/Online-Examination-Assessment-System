import type { DefaultSession } from "next-auth";

import type { AppRole } from "@/modules/auth/types";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: AppRole;
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    role: AppRole;
    isActive: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: AppRole;
    isActive?: boolean;
  }
}

export {};

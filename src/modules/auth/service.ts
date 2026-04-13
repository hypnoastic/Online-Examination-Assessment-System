import { compare } from "bcryptjs";

import { mockUsers } from "@/modules/auth/mock-users";
import type { SessionUser } from "@/modules/auth/types";

export type CredentialValidationResult =
  | {
      success: true;
      user: SessionUser;
    }
  | {
      success: false;
      reason: "invalid_credentials" | "inactive_account";
    };

export function findUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return mockUsers.find((user) => user.email.toLowerCase() === normalizedEmail);
}

export async function validateCredentials(
  email: string,
  password: string,
): Promise<CredentialValidationResult> {
  const user = findUserByEmail(email);

  if (!user) {
    return { success: false, reason: "invalid_credentials" };
  }

  if (user.status !== "ACTIVE") {
    return { success: false, reason: "inactive_account" };
  }

  const isPasswordValid = await compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return { success: false, reason: "invalid_credentials" };
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: true,
    },
  };
}

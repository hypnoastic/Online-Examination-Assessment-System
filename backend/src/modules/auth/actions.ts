"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn, signOut } from "../../auth";
import { getDashboardRouteForRole } from "../../lib/auth/rbac";
import { routes } from "../../lib/routes";
import {
  initialLoginFormState,
  type LoginFormState,
} from "./login-form-state";
import { validateCredentials } from "./service";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Institutional email is required.")
    .email("Enter a valid institutional email."),
  password: z.string().min(1, "Password is required."),
});

export async function loginWithCredentials(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Fix the highlighted fields and try again.",
      fieldErrors: {
        email: parsed.error.flatten().fieldErrors.email?.[0],
        password: parsed.error.flatten().fieldErrors.password?.[0],
      },
      fields: {
        email: String(formData.get("email") ?? ""),
      },
    };
  }

  const result = await validateCredentials(parsed.data.email, parsed.data.password);

  if (!result.success) {
    if (result.reason === "inactive_account") {
      return {
        status: "error",
        message:
          "This account is inactive. Contact an administrator before trying again.",
        fields: {
          email: parsed.data.email,
        },
      };
    }

    return {
      status: "error",
      message: "Invalid email or password.",
      fields: {
        email: parsed.data.email,
      },
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: getDashboardRouteForRole(result.user.role),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Unable to start a session. Try again.",
        fields: {
          email: parsed.data.email,
        },
      };
    }

    throw error;
  }

  return initialLoginFormState;
}

export async function logoutUser() {
  await signOut({
    redirectTo: routes.login,
  });
}

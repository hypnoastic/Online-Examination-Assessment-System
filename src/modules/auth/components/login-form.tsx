"use client";

import { useActionState } from "react";

import { loginWithCredentials } from "@/modules/auth/actions";
import {
  initialLoginFormState,
} from "@/modules/auth/login-form-state";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      className="button-link button-link--primary"
      type="submit"
      disabled={pending}
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginWithCredentials,
    initialLoginFormState,
  );

  return (
    <form className="login-form" action={formAction}>
      <div className="form-field">
        <label htmlFor="email">Institutional email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="faculty@college.edu"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          inputMode="email"
          required
          spellCheck={false}
          defaultValue={state.fields?.email ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        {state.fieldErrors?.email ? (
          <p className="form-field__error" id="email-error">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
        />
        {state.fieldErrors?.password ? (
          <p className="form-field__error" id="password-error">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p className="form-alert" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="login-form__meta">
        <span>Credentials auth active</span>
        <span>Session state resolves server-side</span>
      </div>

      <div className="login-form__actions">
        <SubmitButton pending={pending} />
      </div>
    </form>
  );
}

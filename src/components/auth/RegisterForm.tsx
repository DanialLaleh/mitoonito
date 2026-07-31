"use client";

import { useActionState } from "react";
import {
  registerAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initial: AuthActionState = { ok: false };

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initial
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="name">
          نام
        </label>

        <input
          id="name"
          name="name"
          className="input"
          placeholder="مثلاً لاله"
          required
          minLength={2}
          disabled={pending}
        />

        {state.fieldErrors?.name?.[0] ? (
          <p className="text-xs text-red-600">
            {state.fieldErrors.name[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="email">
          ایمیل
        </label>

        <input
          id="email"
          name="email"
          type="email"
          className="input"
          placeholder="you@example.com"
          required
          disabled={pending}
          autoComplete="email"
        />

        {state.fieldErrors?.email?.[0] ? (
          <p className="text-xs text-red-600">
            {state.fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="password">
          رمز عبور
        </label>

        <input
          id="password"
          name="password"
          type="password"
          className="input"
          placeholder="حداقل ۸ کاراکتر"
          required
          minLength={8}
          disabled={pending}
          autoComplete="new-password"
        />

        {state.fieldErrors?.password?.[0] ? (
          <p className="text-xs text-red-600">
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={pending}
      >
        {pending ? "در حال ساخت حساب..." : "ثبت‌نام و ورود"}
      </button>
    </form>
  );
}

"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "@/actions/auth";

export default function LoginPage() {
  const { theme } = useTheme();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    loginAction,
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <img
          src={theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
          alt="میتونی‌تو"
          className="h-24 w-auto mx-auto mb-4"
        />
        <p className="text-lg font-bold text-center mb-1 text-gray-900 dark:text-gray-100">
          میتونی‌تو؛ خودت رو بساز
        </p>
        <h1 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mb-6">
          ورود
        </h1>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              ایمیل
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
          >
            {isPending ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          حساب نداری؟{" "}
          <Link href="/register" className="text-green-600 font-medium">
            بساز
          </Link>
        </p>
      </div>
    </div>
  );
}

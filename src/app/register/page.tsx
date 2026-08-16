"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type ActionState } from "@/actions/auth";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    registerAction,
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-center mb-1">
          ساخت حساب کاربری
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          به میتونی‌تو خوش اومدی
        </p>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              نام
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              ایمیل
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
            {isPending ? "در حال ساخت حساب..." : "ساخت حساب"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          حساب داری؟{" "}
          <Link href="/login" className="text-green-600 font-medium">
            وارد شو
          </Link>
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo href="/" />
          <h1 className="text-xl font-bold">ورود به میتونی‌تو</h1>
          <p className="text-sm text-brand-charcoal/70">
            برنامه‌هات منتظرند — از جایی که رها کردی ادامه بده.
          </p>
        </div>

        <form className="space-y-4">
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
              disabled
            />
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
              placeholder="••••••••"
              required
              disabled
            />
          </div>
          <button type="button" className="btn-primary w-full" disabled>
            به‌زودی فعال می‌شود
          </button>
        </form>

        <p className="text-center text-sm">
          حساب ندارید؟{" "}
          <Link href="/register" className="font-medium text-brand hover:text-brand-dark">
            ثبت‌نام
          </Link>
        </p>
      </div>
    </main>
  );
}

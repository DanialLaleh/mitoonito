import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSession } from "@/lib/auth/session";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/app/today");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo href="/" />
          <h1 className="text-xl font-bold">ساخت حساب میتونی‌تو</h1>
          <p className="text-sm text-brand-charcoal/70">
            کمتر از یک دقیقه — بعد می‌روید سراغ اولین پلنر.
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link
            href="/login"
            className="font-medium text-brand hover:text-brand-dark"
          >
            ورود
          </Link>
        </p>
      </div>
    </main>
  );
}

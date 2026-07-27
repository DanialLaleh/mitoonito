import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/app/today");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo href="/" />
          <h1 className="text-xl font-bold">ورود به میتونی‌تو</h1>
          <p className="text-sm text-brand-charcoal/70">
            برنامه‌ها منتظرند — از همان‌جا که رها کردید ادامه دهید.
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm">
          حساب ندارید؟{" "}
          <Link
            href="/register"
            className="font-medium text-brand hover:text-brand-dark"
          >
            ثبت‌نام
          </Link>
        </p>
      </div>
    </main>
  );
}

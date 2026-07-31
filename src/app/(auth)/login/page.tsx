// src/app/(auth)/login/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/app/today");

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="mt-4 text-center">
          حساب ندارید؟{" "}
          <Link href="/register" className="underline">
            ثبت‌نام
          </Link>
        </p>
      </div>
    </main>
  );
}

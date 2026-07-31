// src/app/(auth)/register/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import RegisterForm from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/app/today");

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <RegisterForm />
        <p className="mt-4 text-center">
          حساب دارید؟{" "}
          <Link href="/login" className="underline">
            ورود
          </Link>
        </p>
      </div>
    </main>
  );
}

// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center gap-4">
      <Link href="/login" className="btn-secondary">
        ورود
      </Link>
      <Link href="/register" className="btn-primary">
        شروع رایگان
      </Link>
    </main>
  );
}

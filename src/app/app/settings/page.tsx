import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { logoutAction } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell title="تنظیمات">
      <div className="space-y-4">
        <div className="card space-y-3">
          <h2 className="font-bold">حساب کاربری</h2>
          <div className="space-y-1 text-sm leading-7">
            <p>
              <span className="text-brand-charcoal/70">نام: </span>
              {user.name || "—"}
            </p>
            <p>
              <span className="text-brand-charcoal/70">ایمیل: </span>
              {user.email}
            </p>
            <p>
              <span className="badge-success">
                پلن فعلی: {user.plan === "PREMIUM" ? "پرمیوم" : "رایگان"}
              </span>
            </p>
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="font-bold">خروج</h2>
          <p className="text-sm text-brand-charcoal/75">
            با خروج، نشست این دستگاه بسته می‌شود.
          </p>
          <form action={logoutAction}>
            <button type="submit" className="btn-secondary">
              خروج از حساب
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

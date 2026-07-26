import { AppShell } from "@/components/app/AppShell";

export default function SettingsPage() {
  return (
    <AppShell title="تنظیمات">
      <div className="card space-y-2">
        <h2 className="font-bold">تنظیمات و اشتراک</h2>
        <p className="text-sm leading-7 text-brand-charcoal/75">
          پروفایل، پلن رایگان/پرمیوم و خروج — بعد از اتصال حساب کاربری.
        </p>
        <span className="badge-success">پلن فعلی: رایگان</span>
      </div>
    </AppShell>
  );
}

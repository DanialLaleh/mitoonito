import { AppShell } from "@/components/app/AppShell";

export default function AreasPage() {
  return (
    <AppShell title="حوزه‌ها">
      <div className="card">
        <h2 className="font-bold">حوزه‌های پلنر</h2>
        <p className="mt-2 text-sm leading-7 text-brand-charcoal/75">
          درسی، ورزشی، تغذیه، روزانه و حوزه‌های سفارشی اینجا ساخته می‌شوند.
        </p>
      </div>
    </AppShell>
  );
}

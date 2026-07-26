import { AppShell } from "@/components/app/AppShell";

export default function DashboardPage() {
  return (
    <AppShell title="داشبورد">
      <div className="card">
        <h2 className="font-bold">داشبورد ماهانه</h2>
        <p className="mt-2 text-sm leading-7 text-brand-charcoal/75">
          درصد پیشرفت ماه جاری و مقایسه با ماه قبل (تقویم شمسی) اینجا می‌آید.
        </p>
      </div>
    </AppShell>
  );
}

import { AppShell } from "@/components/app/AppShell";

export default function GoalsPage() {
  return (
    <AppShell title="اهداف">
      <div className="card">
        <h2 className="font-bold">اهداف</h2>
        <p className="mt-2 text-sm leading-7 text-brand-charcoal/75">
          هدف‌گذاری و درصد پیشرفت در مرحله بعد فعال می‌شود.
        </p>
      </div>
    </AppShell>
  );
}

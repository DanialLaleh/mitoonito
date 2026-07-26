import { AppShell } from "@/components/app/AppShell";

export default function HabitsPage() {
  return (
    <AppShell title="عادت‌ها">
      <div className="card">
        <h2 className="font-bold">عادت‌ها</h2>
        <p className="mt-2 text-sm leading-7 text-brand-charcoal/75">
          ثبت روزانه عادت و streak به‌زودی اضافه می‌شود.
        </p>
      </div>
    </AppShell>
  );
}

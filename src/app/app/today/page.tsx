import { AppShell } from "@/components/app/AppShell";

export default function TodayPage() {
  return (
    <AppShell title="امروز">
      <div className="space-y-4">
        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">پیشرفت امروز</h2>
              <p className="mt-1 text-sm text-brand-charcoal/70">
                به‌زودی درصد واقعی از کارهای تیک‌خورده اینجا می‌آید.
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft/40 text-sm font-bold text-brand-dark">
              ۰٪
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">کارهای امروز</h2>
            <span className="badge-success">نسخه اولیه</span>
          </div>
          <p className="text-sm leading-7 text-brand-charcoal/75">
            هنوز دیتابیس و ثبت‌نام وصل نیست. در مرحله بعد می‌توانید کار اضافه
            کنید و تیک بزنید.
          </p>
          <button type="button" className="btn-primary" disabled>
            افزودن کار (به‌زودی)
          </button>
        </div>
      </div>
    </AppShell>
  );
}

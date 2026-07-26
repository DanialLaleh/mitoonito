import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Logo priority />
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-secondary">
            ورود
          </Link>
          <Link href="/register" className="btn-primary">
            شروع رایگان
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        <div className="card overflow-hidden p-0">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="space-y-5 p-8 md:p-10">
              <span className="badge-success">پلنر شخصی فارسی</span>
              <h1 className="text-3xl font-bold leading-relaxed md:text-4xl">
                برنامه‌ت رو بریز،
                <br />
                هر روز تیک بزن،
                <br />
                <span className="text-brand">پیشرفت ماهانه‌ت</span> رو ببین.
              </h1>
              <p className="text-sm leading-7 text-brand-charcoal/80 md:text-base">
                میتونی‌تو برای برنامه‌ریزی واقعی ساخته شده؛ نه یک تقویم شلوغ.
                پلنر درسی، ورزشی، تغذیه، روزانه و هدف‌گذاری — ساده، سریع و
                موبایل‌دوست.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="btn-primary">
                  همین حالا شروع کن
                </Link>
                <Link href="/pricing" className="btn-secondary">
                  مشاهده اشتراک‌ها
                </Link>
              </div>
            </div>

            <div className="border-t border-brand-gray bg-[#F7FBF6] p-8 md:border-r-0 md:border-t-0 md:border-s border-brand-gray md:p-10">
              <div className="space-y-4">
                {[
                  {
                    title: "امروز",
                    desc: "کارهای امروز را ببین و سریع تیک بزن",
                  },
                  {
                    title: "حوزه‌ها",
                    desc: "برای درس، ورزش، تغذیه و روزمره پلن جدا بساز",
                  },
                  {
                    title: "داشبورد",
                    desc: "آخر ماه درصد پیشرفت و مقایسه با قبل",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-brand-gray bg-white p-4"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                      <h2 className="font-semibold">{item.title}</h2>
                    </div>
                    <p className="text-sm leading-6 text-brand-charcoal/75">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

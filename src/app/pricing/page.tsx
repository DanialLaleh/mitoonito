import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const plans = [
  {
    name: "رایگان",
    price: "۰ تومان",
    features: ["۲ حوزه پلنر", "۳ هدف فعال", "۵ عادت", "داشبورد ماه جاری"],
    cta: "شروع رایگان",
    href: "/register",
    highlight: false,
  },
  {
    name: "پرمیوم",
    price: "به‌زودی",
    features: [
      "حوزه و هدف نامحدود",
      "عادت نامحدود",
      "مقایسه با ماه و سال قبل",
      "آماده‌سازی مدیریت مالی (فاز بعد)",
    ],
    cta: "ثبت‌نام و رزرو",
    href: "/register",
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Logo />
        <Link href="/login" className="btn-secondary">
          ورود
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">اشتراک میتونی‌تو</h1>
          <p className="mt-3 text-sm leading-7 text-brand-charcoal/80">
            درگاه پرداخت کمی بعد وصل می‌شود؛ الان اسکلت پلن‌ها آماده است.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card ${plan.highlight ? "border-brand ring-2 ring-brand/20" : ""}`}
            >
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="mt-2 text-2xl font-semibold text-brand">{plan.price}</p>
              <ul className="mt-5 space-y-2 text-sm leading-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-6 w-full ${plan.highlight ? "btn-primary" : "btn-secondary"}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

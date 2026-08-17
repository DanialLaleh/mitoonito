import { toPersianDigits } from "@/lib/format";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Target,
  Wallet,
  Bell,
  Flame,
  Sparkles,
} from "lucide-react";
import { formatHourRange } from "@/lib/analytics";

type Task = { id: string; title: string; status: string };
type Habit = {
  id: string;
  title: string;
  completedToday: boolean;
  currentStreak: number;
};
type Goal = {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
};
type Reminder = { id: string; text: string; remindAt: Date };

export default function Dashboard({
  userName,
  todayTasks,
  habits,
  goals,
  upcomingReminders,
  monthIncome,
  monthExpense,
  goldenHours,
}: {
  userName: string;
  todayTasks: Task[];
  habits: Habit[];
  goals: Goal[];
  upcomingReminders: Reminder[];
  monthIncome: number;
  monthExpense: number;
  goldenHours: { hasEnoughData: boolean; hours: number[] };
}) {
  const doneCount = todayTasks.filter((t) => t.status === "DONE").length;
  const totalCount = todayTasks.length;
  const habitsDoneCount = habits.filter((h) => h.completedToday).length;
  const balance = monthIncome - monthExpense;

  const today = new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold">سلام {userName} 👋</h1>
        <p className="text-sm text-gray-400 mt-1">{today}</p>
      </div>

      {/* خلاصه امروز */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">وظایف امروز</p>
          <p className="text-lg font-bold">
            {toPersianDigits(doneCount)} / {toPersianDigits(totalCount)}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">عادت‌های امروز</p>
          <p className="text-lg font-bold">
            {toPersianDigits(habitsDoneCount)} /{" "}
            {toPersianDigits(habits.length)}
          </p>
        </div>
      </div>

      {/* ساعات طلایی */}
      {goldenHours.hasEnoughData && goldenHours.hours.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <Sparkles size={18} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">ساعات طلایی تو</p>
            <p className="text-xs text-green-700 mt-0.5">
              بیشترین بهره‌وری‌ت معمولاً بین{" "}
              {goldenHours.hours.map(formatHourRange).join(" یا ")} هست.
            </p>
          </div>
        </div>
      )}
      {!goldenHours.hasEnoughData && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4 text-xs text-gray-400">
          هنوز داده‌ی کافی برای تحلیل ساعات طلایی نداری. چند وظیفه‌ی دیگه تموم
          کن تا این بخش فعال بشه.
        </div>
      )}

      {/* وظایف امروز */}
      <SectionCard
        title="وظایف امروز"
        href="/today"
        icon={<CheckCircle2 size={16} />}
      >
        {todayTasks.length === 0 ? (
          <EmptyLine text="وظیفه‌ای برای امروز نداری" />
        ) : (
          todayTasks.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center gap-2 py-1.5 text-sm">
              {t.status === "DONE" ? (
                <CheckCircle2 size={15} className="text-green-600 shrink-0" />
              ) : (
                <Circle size={15} className="text-gray-300 shrink-0" />
              )}
              <span
                className={
                  t.status === "DONE" ? "line-through text-gray-400" : ""
                }
              >
                {t.title}
              </span>
            </div>
          ))
        )}
      </SectionCard>

      {/* عادت‌های امروز */}
      <SectionCard
        title="عادت‌های امروز"
        href="/habits"
        icon={<Flame size={16} />}
      >
        {habits.length === 0 ? (
          <EmptyLine text="هنوز عادتی نساختی" />
        ) : (
          habits.slice(0, 5).map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between py-1.5 text-sm"
            >
              <div className="flex items-center gap-2">
                {h.completedToday ? (
                  <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                ) : (
                  <Circle size={15} className="text-gray-300 shrink-0" />
                )}
                <span>{h.title}</span>
              </div>
              {h.currentStreak > 0 && (
                <span className="text-xs text-orange-500 flex items-center gap-0.5">
                  <Flame size={11} />
                  {toPersianDigits(h.currentStreak)}
                </span>
              )}
            </div>
          ))
        )}
      </SectionCard>

      {/* پیشرفت اهداف */}
      <SectionCard
        title="پیشرفت اهداف"
        href="/goals"
        icon={<Target size={16} />}
      >
        {goals.length === 0 ? (
          <EmptyLine text="هنوز هدفی نساختی" />
        ) : (
          goals.slice(0, 3).map((g) => {
            const percent = Math.min(
              100,
              Math.round((g.currentValue / g.targetValue) * 100)
            );
            return (
              <div key={g.id} className="py-1.5">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{g.title}</span>
                  <span className="text-gray-400 text-xs">
                    {toPersianDigits(percent)}٪
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-green-600 h-1.5 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </SectionCard>

      {/* خلاصه مالی */}
      <SectionCard
        title="مالی این ماه"
        href="/finances"
        icon={<Wallet size={16} />}
      >
        <div className="flex items-center justify-between text-sm py-1">
          <span className="text-gray-500">تراز</span>
          <span
            className={`font-medium ${
              balance >= 0 ? "text-gray-900" : "text-red-500"
            }`}
          >
            {new Intl.NumberFormat("fa-IR").format(balance)} تومان
          </span>
        </div>
      </SectionCard>

      {/* یادآورها */}
      {upcomingReminders.length > 0 && (
        <SectionCard
          title="یادآورهای نزدیک"
          href="/reminders"
          icon={<Bell size={16} />}
        >
          {upcomingReminders.slice(0, 3).map((r) => (
            <div key={r.id} className="text-sm py-1.5">
              {r.text}
            </div>
          ))}
        </SectionCard>
      )}
    </div>
  );
}

function SectionCard({
  title,
  href,
  icon,
  children,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-3">
      <Link
        href={href}
        className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700"
      >
        {icon}
        {title}
      </Link>
      {children}
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="text-xs text-gray-400 py-2">{text}</p>;
}

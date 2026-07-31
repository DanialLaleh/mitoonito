import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import dayjs from "dayjs";
import { toggleTaskAction, logHabitAction } from "./actions";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null | undefined) {
  if (!date) return "بدون زمان";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const now = dayjs();
  const start = now.startOf("day").toDate();
  const end = now.endOf("day").toDate();

  const [tasks, habits] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: user.id,
        OR: [{ dueDate: { gte: start, lte: end } }, { dueDate: null }],
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.habit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 pb-24 md:pb-10">
      <header className="mb-8">
        <p className="text-sm text-brand-charcoal/70">امروز</p>
        <h1 className="mt-2 text-3xl font-bold">تمرکز امروز</h1>
        <p className="mt-2 text-sm text-brand-charcoal/70">
          کارهای کوچک امروز، نتیجه‌های بزرگ فردا را می‌سازند.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">کارهای امروز</h2>
          <span className="text-sm text-brand-charcoal/60">
            {tasks.length} کار
          </span>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="card p-6 text-sm text-brand-charcoal/70">
              برای امروز کاری نداری. یک کار سبک اضافه کن.
            </div>
          ) : (
            tasks.map((task) => (
              <form
                key={task.id}
                action={toggleTaskAction}
                className="card flex items-center gap-3 p-4"
              >
                <input type="hidden" name="taskId" value={task.id} />
                <input
                  type="hidden"
                  name="done"
                  value={String(!task.done)}
                />
                <button
                  className={`h-5 w-5 rounded-full border-2 ${
                    task.done
                      ? "border-brand bg-brand"
                      : "border-brand-charcoal/30"
                  }`}
                  aria-label="تکمیل کار"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium ${
                      task.done ? "text-brand-charcoal/50 line-through" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="mt-1 text-xs text-brand-charcoal/60">
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              </form>
            ))
          )}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">عادت‌های امروز</h2>
          <span className="text-sm text-brand-charcoal/60">
            {habits.length} عادت
          </span>
        </div>

        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="card p-6 text-sm text-brand-charcoal/70">
              هنوز عادتی نداری. از بخش عادت‌ها یکی اضافه کن.
            </div>
          ) : (
            habits.map((habit) => (
              <form
                key={habit.id}
                action={logHabitAction}
                className="card flex items-center gap-3 p-4"
              >
                <input type="hidden" name="habitId" value={habit.id} />
                <input type="hidden" name="done" value="true" />
                <button
                  className="h-5 w-5 rounded-full border-2 border-brand-charcoal/30"
                  aria-label="ثبت عادت"
                />
                <div className="flex-1">
                  <p className="font-medium">{habit.title}</p>
                  <p className="mt-1 text-xs text-brand-charcoal/60">
                    {habit.streak} امتیاز
                  </p>
                </div>
              </form>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

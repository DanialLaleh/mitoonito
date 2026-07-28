import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AppShell } from "@/components/app/AppShell";
import { createTaskAction, toggleTaskAction, deleteTaskAction } from "./actions";

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // دریافت حوزه‌های کاربر جهت انتساب به تسک‌ها
  const areas = await prisma.area.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
  });

  // دریافت تسک‌های امروز کاربر
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      area: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">امروز</h1>
          <p className="text-sm text-dark-gray/70">برنامه‌ریزی و تسک‌های روز جاری</p>
        </div>

        {/* فرم ثبت تسک جدید */}
        <form
          action={createTaskAction}
          className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
        >
          <input
            name="title"
            placeholder="کارهاتو یادداشت کن..."
            required
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green"
          />

          <select
            name="areaId"
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green"
          >
            <option value="">بدون حوزه</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.title}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-xl bg-brand-green px-6 py-3 font-medium text-white transition hover:bg-brand-darkGreen"
          >
            ثبت
          </button>
        </form>

        {/* لیست تسک‌ها */}
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-dark-gray/60">
            امروز هنوز تسکی نساخته‌ای. اولین کار امروز را اضافه کن!
          </div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {/* فرم تغییر وضعیت تسک */}
                  <form action={toggleTaskAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <input
                      type="hidden"
                      name="isCompleted"
                      value={task.isCompleted ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.isCompleted
                          ? "border-brand-green bg-brand-green text-white"
                          : "border-gray-300 hover:border-brand-green"
                      }`}
                    >
                      {task.isCompleted && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </form>

                  <span
                    className={`font-medium ${
                      task.isCompleted ? "text-dark-gray/40 line-through" : "text-dark-gray"
                    }`}
                  >
                    {task.title}
                  </span>

                  {task.area && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs text-white"
                      style={{ backgroundColor: task.area.color }}
                    >
                      {task.area.title}
                    </span>
                  )}
                </div>

                {/* فرم حذف تسک */}
                <form action={deleteTaskAction}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <button
                    type="submit"
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    حذف
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

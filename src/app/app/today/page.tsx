// src/app/app/today/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createTaskAction,
  toggleTaskCompletedAction,
  deleteTaskAction,
} from "@/app/actions/tasks";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function TodayPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  
  // محاسبه تاریخ هدف (پیش‌فرض امروز)
  const targetDate = resolvedParams.date
    ? new Date(resolvedParams.date)
    : new Date();

  // تعیین ابتدا و انتهای روز برای فیلتر دقیق
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // واکشی تسک‌های مربوط به تاریخ انتخاب شده بر اساس dueDate
  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      dueDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // محاسبه آمار کوتاه برای نمایش به کاربر
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // تاریخ‌های روز قبل و بعد برای ناوبری سریع
  const prevDateStr = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const nextDateStr = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const formattedTargetDate = targetDate.toLocaleDateString("fa-IR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
      {/* هدر صفحه و ناوبری تاریخ */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <a
          href={`/app/today?date=${prevDateStr}`}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
        >
          ← دیروز
        </a>
        <div className="text-center">
          <h1 className="font-bold text-gray-800 text-lg">برنامه‌ریزی روزانه</h1>
          <p className="text-xs text-gray-500 mt-1">{formattedTargetDate}</p>
        </div>
        <a
          href={`/app/today?date=${nextDateStr}`}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
        >
          فردا →
        </a>
      </div>

      {/* بخش آمار کارایی روز */}
      {totalCount > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">میزان پیشرفت امروز</p>
              <h3 className="text-2xl font-bold mt-1">{completionRate}%</h3>
            </div>
            <div className="text-right">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                {completedCount} از {totalCount} تسک
              </span>
            </div>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* لیست تسک‌ها */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm">لیست کارها</h2>
        {tasks.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm">
            هیچ تسکی برای این روز ثبت نشده است.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                task.isCompleted
                  ? "bg-gray-50/80 border-gray-100 opacity-75"
                  : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* فرم Toggle وضعیت تسک */}
                <form action={toggleTaskCompletedAction} className="flex items-center">
                  <input type="hidden" name="id" value={task.id} />
                  <input
                    type="hidden"
                    name="isCompleted"
                    value={task.isCompleted ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-green-500"
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

                <div className="truncate">
                  <p
                    className={`text-sm font-medium ${
                      task.isCompleted ? "line-through text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.completedAt && (
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      انجام شده در ساعت {new Date(task.completedAt).toLocaleTimeString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* فرم حذف تسک */}
              <form action={deleteTaskAction}>
                <input type="hidden" name="id" value={task.id} />
                <button
                  type="submit"
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      {/* فرم ایجاد تسک جدید */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">افزودن کار جدید</h3>
        <form action={createTaskAction} className="flex gap-2">
          <input
            type="hidden"
            name="dueDate"
            value={targetDate.toISOString().split("T")[0]}
          />
          <input
            type="text"
            name="title"
            placeholder="مثال: تمرین با وزنه برای فیتنس..."
            required
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition"
          >
            ثبت
          </button>
        </form>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createTaskAction, toggleTaskCompletedAction, deleteTaskAction } from "@/app/actions/tasks";
import { logHabitAction } from "@/app/actions/habits";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  // ۱. مدیریت تاریخ انتخابی (امروز یا روزهای گذشته/آینده)
  const resolvedSearchParams = await searchParams;
  const targetDateStr = resolvedSearchParams.date || new Date().toISOString().split("T")[0];
  const [year, month, day] = targetDateStr.split("-").map(Number);
  
  const targetDateStart = new Date(year, month - 1, day, 0, 0, 0, 0);
  const targetDateEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

  // ۲. واکشی تسک‌های مربوط به تاریخ انتخابی
  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      date: {
        gte: targetDateStart,
        lte: targetDateEnd,
      },
    },
    include: {
      goal: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // ۳. واکشی لیست عادت‌ها و لاگ‌های آن‌ها برای تاریخ انتخابی
  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    include: {
      logs: {
        where: {
          loggedAt: {
            gte: targetDateStart,
            lte: targetDateEnd,
          },
        },
      },
    },
  });

  // ۴. دریافت لیست اهداف فعال جهت اتصال تسک‌های جدید به اهداف
  const activeGoals = await prisma.goal.findMany({
    where: { userId: user.id, isCompleted: false },
  });

  // تغییر روز (روز قبل و روز بعد) برای ناوبری سریع در PWA
  const prevDate = new Date(targetDateStart);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDateStr = prevDate.toISOString().split("T")[0];

  const nextDate = new Date(targetDateStart);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateStr = nextDate.toISOString().split("T")[0];

  const formattedTargetDate = targetDateStart.toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 text-right animate-fadeIn" dir="rtl">
      {/* ناوبری تاریخ */}
      <div className="flex justify-between items-center bg-white border border-[#E6E7E8] p-3 rounded-2xl mb-6 shadow-sm">
        <a
          href={`/app/today?date=${prevDateStr}`}
          className="px-3 py-1 bg-gray-50 border border-[#E6E7E8] rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors"
        >
          روز قبل
        </a>
        <span className="text-sm font-bold text-[#434345]">{formattedTargetDate}</span>
        <a
          href={`/app/today?date=${nextDateStr}`}
          className="px-3 py-1 bg-gray-50 border border-[#E6E7E8] rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors"
        >
          روز بعد
        </a>
      </div>

      {/* بخش عادت‌های امروز */}
      <div className="bg-white border border-[#E6E7E8] rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-sm font-bold text-[#434345] mb-3">عادت‌های روزانه</h2>
        {habits.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">
            هنوز عادتی ثبت نکرده‌ای. به صفحه عادت‌ها برو و اولین عادتت را بساز.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {habits.map((habit) => {
              const isLogged = habit.logs.length > 0;
              return (
                <form key={habit.id} action={logHabitAction} className="w-full">
                  <input type="hidden" name="habitId" value={habit.id} />
                  <input type="hidden" name="date" value={targetDateStr} />
                  <button
                    type="submit"
                    className={`w-full text-right p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all active:scale-95 ${
                      isLogged
                        ? "bg-[#50B848]/10 border-[#50B848] text-[#367639]"
                        : "bg-gray-50 border-[#E6E7E8] text-[#434345] hover:bg-gray-100"
                    }`}
                  >
                    <span>{habit.title}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isLogged ? "bg-[#50B848] border-[#50B848]" : "border-[#E6E7E8]"
                      }`}
                    >
                      {isLogged && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </button>
                </form>
              );
            })}
          </div>
        )}
      </div>

      {/* بخش تسک‌های امروز */}
      <div className="bg-white border border-[#E6E7E8] rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-sm font-bold text-[#434345] mb-3">کارهای امروز</h2>

        {/* لیست تسک‌ها */}
        <div className="space-y-3 mb-4">
          {tasks.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">هیچ تسکی برای این روز ثبت نشده است.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-[#E6E7E8]"
              >
                <div className="flex items-center gap-3">
                  <form action={toggleTaskCompletedAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="isCompleted" value={task.isCompleted ? "false" : "true"} />
                    <button
                      type="submit"
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        task.isCompleted ? "bg-[#50B848] border-[#50B848]" : "border-[#E6E7E8] bg-white"
                      }`}
                    >
                      {task.isCompleted && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </form>

                  <div className="text-right">
                    <span className={`text-xs font-semibold block ${task.isCompleted ? "line-through text-gray-400" : "text-[#434345]"}`}>
                      {task.title}
                    </span>
                    {task.goal && (
                      <span className="inline-block text-[9px] bg-[#9FD18B]/20 text-[#367639] px-1.5 py-0.5 rounded-md mt-1 font-bold">
                        هدف: {task.goal.title}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.completedAt && (
                    <span className="text-[10px] text-gray-400 font-mono" dir="ltr">
                      {new Date(task.completedAt).toLocaleTimeString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                  )}
                  <form action={deleteTaskAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <button type="submit" className="text-red-400 hover:text-red-600 text-xs">
                      حذف
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>

        {/* فرم ثبت تسک جدید با ساعت و اتصال اختیاری به اهداف */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-xs font-bold text-gray-500 mb-3">افزودن کار جدید</h3>
          <form action={createTaskAction} className="space-y-3">
            <input type="hidden" name="date" value={targetDateStr} />

            <input
              type="text"
              name="title"
              placeholder="مثال: تولید محتوای اینستاگرام میتونی‌تو"
              required
              className="w-full px-3 py-2 text-xs border border-[#E6E7E8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#50B848]"
            />

            <div className="grid grid-cols-2 gap-2">
              {/* تعیین ساعت دلخواه (۲۴ ساعته) */}
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">ساعت انجام (اختیاری)</label>
                <input
                  type="time"
                  name="time"
                  className="w-full px-3 py-2 text-xs border border-[#E6E7E8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#50B848] text-gray-500"
                />
              </div>

              {/* اتصال به هدف */}
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">اتصال به هدف</label>
                <select
                  name="goalId"
                  className="w-full px-3 py-2 text-xs border border-[#E6E7E8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#50B848] text-gray-500"
                >
                  <option value="">بدون هدف</option>
                  {activeGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#50B848] text-white py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform"
            >
              ثبت تسک
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

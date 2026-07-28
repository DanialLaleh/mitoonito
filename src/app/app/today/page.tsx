import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AppShell } from "@/components/app/AppShell";
import { createTaskAction, toggleTaskAction, deleteTaskAction } from "@/app/actions/tasks";
import { format } from "date-fns-jalali"; // استفاده از تقویم جلالی برای نمایش بهتر

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const areas = await prisma.area.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
  });

  // دریافت تسک‌های امروز (بر اساس فیلد date و نه createdAt)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      date: { gte: todayStart, lte: todayEnd },
    },
    include: { area: true },
    orderBy: { date: "desc" },
  });

  const todayJalali = format(new Date(), "yyyy-MM-dd");

  return (
    <AppShell>
      <div className="space-y-6 pb-24" dir="rtl">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-[#434345]">برنامه امروز</h1>
            <p className="text-xs text-gray-400 mt-1">امروز چه کارهای مهمی رو قراره تموم کنی؟</p>
          </div>
          <div className="text-left">
             <span className="text-[10px] font-bold text-[#50B848] bg-[#9FD18B]/20 px-3 py-1 rounded-full">
               {format(new Date(), "eeee d MMMM")}
             </span>
          </div>
        </div>

        {/* فرم ثبت تسک هوشمند */}
        <div className="bg-white rounded-[2rem] border border-[#E6E7E8] p-5 shadow-sm">
          <form action={createTaskAction} className="space-y-4">
            <input
              name="title"
              placeholder="مثلاً: تمرینات فیتنس - سینه و پشت بازو"
              required
              className="w-full text-sm font-bold bg-gray-50 rounded-2xl border-none px-5 py-4 focus:ring-2 focus:ring-[#50B848] transition-all outline-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                name="areaId"
                className="text-xs bg-gray-50 rounded-xl border-none px-4 py-3 focus:ring-1 focus:ring-[#50B848] outline-none"
              >
                <option value="">بدون حوزه</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>{area.title}</option>
                ))}
              </select>

              <div className="flex gap-2">
                 <input 
                    type="time" 
                    name="time"
                    className="flex-1 text-xs bg-gray-50 rounded-xl border-none px-3 py-3 outline-none"
                 />
                 <input 
                    type="date" 
                    name="date"
                    defaultValue={todayJalali}
                    className="hidden" // در این صفحه پیش‌فرض امروز است اما اکشن آن را می‌پذیرد
                 />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#50B848] text-white py-4 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              افزودن به برنامه
            </button>
          </form>
        </div>

        {/* لیست تسک‌ها با طراحی Mobile-First */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
              <p className="text-gray-400 text-xs">هنوز تسکی برای امروز ثبت نکردی دانیال!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E6E7E8] hover:border-[#50B848]/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <form action={toggleTaskAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="isCompleted" value={task.isCompleted ? "false" : "true"} />
                    <button
                      type="submit"
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.isCompleted
                          ? "bg-[#50B848] border-[#50B848] text-white"
                          : "border-gray-200 hover:border-[#50B848]"
                      }`}
                    >
                      {task.isCompleted && (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </form>

                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${task.isCompleted ? "text-gray-300 line-through" : "text-[#434345]"}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {task.area && (
                        <span 
                          className="text-[9px] px-2 py-0.5 rounded-full text-white font-medium"
                          style={{ backgroundColor: task.area.color }}
                        >
                          {task.area.title}
                        </span>
                      )}
                      {task.date && (
                        <span className="text-[9px] text-gray-400 font-mono">
                          {format(new Date(task.date), "HH:mm")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <form action={deleteTaskAction}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <button type="submit" className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

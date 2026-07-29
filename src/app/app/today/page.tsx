import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { startOfDay, endOfDay } from "date-fns";
import { toggleTaskAction, logHabitAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);

  const [tasks, habits] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: user.id,
        OR: [
          { dueDate: { gte: start, lte: end } },
          { isCompleted: false, dueDate: null }
        ]
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.habit.findMany({
      where: { userId: user.id },
      include: {
        logs: { where: { loggedAt: { gte: start, lte: end } } }
      }
    })
  ]);

  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-xl font-bold text-[#434345] mb-4">تسک‌های امروز</h2>
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <span className={task.isCompleted ? "line-through text-gray-400" : "text-[#434345]"}>{task.title}</span>
              <form action={toggleTaskAction}>
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="isCompleted" value={String(!task.isCompleted)} />
                <button type="submit" className={`w-6 h-6 rounded-full border-2 ${task.isCompleted ? "bg-[#50B848] border-[#50B848]" : "border-gray-300"}`} />
              </form>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#434345] mb-4">عادت‌های امروز</h2>
        <div className="grid grid-cols-2 gap-4">
          {habits.map(habit => (
            <div key={habit.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="font-medium text-[#434345] mb-2">{habit.title}</p>
              <form action={logHabitAction}>
                <input type="hidden" name="habitId" value={habit.id} />
                <button 
                  disabled={habit.logs.length > 0}
                  className={`w-full py-2 rounded-xl text-sm ${habit.logs.length > 0 ? "bg-gray-100 text-gray-400" : "bg-[#9FD18B] text-white"}`}
                >
                  {habit.logs.length > 0 ? "انجام شد" : "ثبت انجام"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

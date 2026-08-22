import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TodayView from "@/components/TodayView";

function toDateOnly(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function TodayPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const today = toDateOnly(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [overdueTasks, todayTasks, habitsRaw, todayReminders] =
    await Promise.all([
      prisma.task.findMany({
        where: {
          userId: session.userId,
          status: { notIn: ["DONE", "SKIPPED"] },
          scheduledDate: { lt: today },
        },
        orderBy: { scheduledDate: "asc" },
      }),
      prisma.task.findMany({
        where: {
          userId: session.userId,
          scheduledDate: { gte: today, lt: tomorrow },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.habit.findMany({
        where: { userId: session.userId, isActive: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.reminder.findMany({
        where: {
          userId: session.userId,
          isActive: true,
          remindAt: { gte: today, lt: tomorrow },
        },
        orderBy: { remindAt: "asc" },
      }),
    ]);

  // فقط عادت‌هایی که امروز روز فعالشونه (بر اساس daysOfWeek)
  const todayWeekDay = today.getDay();
  const applicableHabits = habitsRaw.filter(
    (h) => h.daysOfWeek.length === 0 || h.daysOfWeek.includes(todayWeekDay)
  );

  const habits = await Promise.all(
    applicableHabits.map(async (habit) => {
      const completion = await prisma.habitCompletion.findUnique({
        where: { habitId_date: { habitId: habit.id, date: today } },
      });
      return { ...habit, completedToday: !!completion };
    })
  );

  return (
    <TodayView
      overdueTasks={overdueTasks}
      todayTasks={todayTasks}
      habits={habits}
      todayReminders={todayReminders}
    />
  );
}

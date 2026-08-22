import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { getGoldenHours } from "@/lib/analytics";

function toDateOnly(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const today = toDateOnly(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    tasksRaw,
    habitsRaw,
    goals,
    reminders,
    incomeAgg,
    expenseAgg,
    goldenHours,
  ] = await Promise.all([
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
    prisma.goal.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reminder.findMany({
      where: { userId: session.userId, isActive: true, remindAt: { gte: now } },
      orderBy: { remindAt: "asc" },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: session.userId,
        type: "INCOME",
        date: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: session.userId,
        type: "EXPENSE",
        date: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    getGoldenHours(session.userId),
  ]);

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
    <Dashboard
      userName={session.name}
      todayTasks={tasksRaw}
      habits={habits}
      goals={goals}
      upcomingReminders={reminders}
      monthIncome={incomeAgg._sum.amount ?? 0}
      monthExpense={expenseAgg._sum.amount ?? 0}
      goldenHours={goldenHours}
    />
  );
}

"use server";

import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

type GoalProgress = {
  id: string;
  title: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
};

type HabitSummary = {
  id: string;
  title: string;
  totalLogs: number;
  points: number;
};

type DashboardAnalytics = {
  completedTasksCount: number;
  completedHabitsCount: number;
  incomeTotal: number;
  expenseTotal: number;
  hourlyActivity: Record<number, number>;
  goalsProgress: GoalProgress[];
  habitSummaries: HabitSummary[];
};

export async function getDashboardAnalytics(
  userId: string,
): Promise<DashboardAnalytics> {
  const today = new Date();
  const sevenDaysAgo = subDays(today, 7);

  const [tasks, transactions, goals, habits] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
      orderBy: { dueDate: "asc" },
    }),

    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),

    prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),

    prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const completedTasksCount = tasks.filter((task) => task.done).length;

  const incomeTotal = transactions
    .filter((transaction) => transaction.type.toUpperCase() === "INCOME")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenseTotal = transactions
    .filter((transaction) => transaction.type.toUpperCase() === "EXPENSE")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const hourlyActivity: Record<number, number> = {};

  for (const task of tasks) {
    if (!task.done || !task.dueDate) continue;

    const hour = task.dueDate.getHours();
    hourlyActivity[hour] = (hourlyActivity[hour] ?? 0) + 1;
  }

  const goalsProgress: GoalProgress[] = goals.map((goal) => {
    const progress =
      goal.target > 0
        ? Math.min(100, Math.round((goal.current / goal.target) * 100))
        : 0;

    return {
      id: goal.id,
      title: goal.title,
      progress,
      totalTasks: 0,
      completedTasks: 0,
    };
  });

  const habitSummaries: HabitSummary[] = habits.map((habit) => ({
    id: habit.id,
    title: habit.title,
    totalLogs: 0,
    points: 0,
  }));

  return {
    completedTasksCount,
    completedHabitsCount: 0,
    incomeTotal,
    expenseTotal,
    hourlyActivity,
    goalsProgress,
    habitSummaries,
  };
}

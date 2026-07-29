"use server";

import { prisma } from "@/lib/prisma";
import { getHours, subDays } from "date-fns";

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

export async function getDashboardAnalytics(userId: string): Promise<DashboardAnalytics> {
  try {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);

    const [tasks, habitLogs, transactions, goals, habits] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          dueDate: { gte: sevenDaysAgo, lte: today },
        },
        orderBy: { dueDate: "asc" },
      }),

      prisma.habitLog.findMany({
        where: {
          habit: { userId },
          loggedAt: { gte: sevenDaysAgo, lte: today },
        },
        include: {
          habit: true,
        },
        orderBy: { loggedAt: "asc" },
      }),

      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),

      prisma.goal.findMany({
        where: { userId, isCompleted: false },
        include: {
          tasks: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.habit.findMany({
        where: { userId },
        include: {
          logs: {
            where: {
              loggedAt: { gte: sevenDaysAgo, lte: today },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const completedTasksCount = tasks.filter((task) => task.isCompleted).length;
    const completedHabitsCount = habitLogs.length;

    const incomeTotal = transactions
      .filter((transaction) => transaction.type === "INCOME")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expenseTotal = transactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const hourlyActivity: Record<number, number> = {};

    tasks.forEach((task) => {
      const completionDate = task.completedAt
        ? new Date(task.completedAt)
        : task.dueDate
          ? new Date(task.dueDate)
          : null;

      if (!completionDate) return;

      const hour = getHours(completionDate);
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    habitLogs.forEach((log) => {
      const hour = getHours(new Date(log.loggedAt));
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    const goalsProgress: GoalProgress[] = goals.map((goal) => {
      const totalGoalTasks = goal.tasks.length;
      const completedGoalTasks = goal.tasks.filter((task) => task.isCompleted).length;

      return {
        id: goal.id,
        title: goal.title,
        progress:
          totalGoalTasks > 0
            ? Math.round((completedGoalTasks / totalGoalTasks) * 100)
            : 0,
        totalTasks: totalGoalTasks,
        completedTasks: completedGoalTasks,
      };
    });

    const habitSummaries: HabitSummary[] = habits.map((habit) => ({
      id: habit.id,
      title: habit.title,
      totalLogs: habit.logs.length,
      points: habit.points,
    }));

    return {
      completedTasksCount,
      completedHabitsCount,
      incomeTotal,
      expenseTotal,
      hourlyActivity,
      goalsProgress,
      habitSummaries,
    };
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    throw new Error("خطا در دریافت آمار داشبورد.");
  }
}

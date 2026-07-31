"use server";

import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

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
  userId: string
): Promise<DashboardAnalytics> {
  try {
    const today = dayjs().endOf("day").toDate();
    const sevenDaysAgo = dayjs().subtract(7, "day").startOf("day").toDate();

    const [tasks, transactions, goals, habits] = await Promise.all([
      prisma.task.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
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

    const completedTasks = tasks.filter((task) => task.done);

    const completedTasksCount = completedTasks.length;
    const completedHabitsCount = 0;

    const incomeTotal = transactions
      .filter((transaction) => transaction.type === "INCOME")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expenseTotal = transactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const hourlyActivity: Record<number, number> = {};

    completedTasks.forEach((task) => {
      const hour = dayjs(task.createdAt).hour();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    const goalsProgress: GoalProgress[] = goals.map((goal) => {
      const totalGoalTasks = 1;
      const completedGoalTasks = goal.current >= goal.target ? 1 : 0;

      return {
        id: goal.id,
        title: goal.title,
        progress:
          goal.target > 0
            ? Math.min(100, Math.round((goal.current / goal.target) * 100))
            : 0,
        totalTasks: totalGoalTasks,
        completedTasks: completedGoalTasks,
      };
    });

    const habitSummaries: HabitSummary[] = habits.map((habit) => ({
      id: habit.id,
      title: habit.title,
      totalLogs: 0,
      points: habit.streak || 0,
    }));

    void today;
    void sevenDaysAgo;

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

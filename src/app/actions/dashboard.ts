// src/app/actions/dashboard.ts
"use server";

import { prisma } from "@/lib/prisma";
import { subDays, getHours } from "date-fns";

type ActivityDistribution = {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
};

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
  completedDaysCount: number;
  successRate: number;
};

function getTimeSlotLabel(hourDistribution: ActivityDistribution) {
  let goldenTimeSlot = "نامشخص";
  let maxActivity = 0;

  const slots = [
    { name: "صبح (۶ تا ۱۲)", val: hourDistribution.morning },
    { name: "ظهر و عصر (۱۲ تا ۱۸)", val: hourDistribution.afternoon },
    { name: "شب (۱۸ تا ۲۴)", val: hourDistribution.evening },
    { name: "نیمه‌شب (۲۴ تا ۶)", val: hourDistribution.night },
  ];

  for (const slot of slots) {
    if (slot.val > maxActivity) {
      maxActivity = slot.val;
      goldenTimeSlot = slot.name;
    }
  }

  return goldenTimeSlot;
}

export async function getDashboardAnalytics(userId: string) {
  try {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);

    const [tasks, habitLogs, transactions, goals, habits] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          date: { gte: sevenDaysAgo, lte: today },
        },
        orderBy: { date: "asc" },
      }),

      prisma.habitLog.findMany({
        where: {
          habit: { userId },
          date: { gte: sevenDaysAgo, lte: today },
        },
        include: {
          habit: true,
        },
        orderBy: { date: "asc" },
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
            where: { date: { gte: sevenDaysAgo, lte: today } },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const hourDistribution: ActivityDistribution = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    let completedTasksCount = 0;
    let completedHabitLogsCount = 0;

    for (const task of tasks) {
      if (!task.isCompleted) continue;

      completedTasksCount++;

      if (task.completedAt) {
        const hour = getHours(new Date(task.completedAt));

        if (hour >= 6 && hour < 12) hourDistribution.morning++;
        else if (hour >= 12 && hour < 18) hourDistribution.afternoon++;
        else if (hour >= 18 && hour < 24) hourDistribution.evening++;
        else hourDistribution.night++;
      }
    }

    for (const log of habitLogs) {
      completedHabitLogsCount++;

      const hour = getHours(new Date(log.date));
      if (hour >= 6 && hour < 12) hourDistribution.morning++;
      else if (hour >= 12 && hour < 18) hourDistribution.afternoon++;
      else if (hour >= 18 && hour < 24) hourDistribution.evening++;
      else hourDistribution.night++;
    }

    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of transactions) {
      if (transaction.type === "income") totalIncome += transaction.amount;
      if (transaction.type === "expense") totalExpense += transaction.amount;
    }

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

    const habitsSummary: HabitSummary[] = habits.map((habit) => {
      const completedDaysCount = habit.logs.length;

      return {
        id: habit.id,
        title: habit.title,
        completedDaysCount,
        successRate: Math.round((completedDaysCount / 7) * 100),
      };
    });

    const goldenTimeSlot = getTimeSlotLabel(hourDistribution);

    const totalTaskCount = tasks.length;
    const completionRate =
      totalTaskCount > 0
        ? Math.round((completedTasksCount / totalTaskCount) * 100)
        : 0;

    const activeHabitsCount = habits.length;
    const habitCompletionRate =
      activeHabitsCount > 0
        ? Math.round((completedHabitLogsCount / (activeHabitsCount * 7)) * 100)
        : 0;

    // امتیازدهی ترکیبی برای داشبورد
    const productivityScore =
      completedTasksCount * 100 +
      completedHabitLogsCount * 50 +
      goalsProgress.reduce((sum, goal) => sum + goal.progress, 0) +
      Math.max(0, totalIncome - totalExpense) / 1000;

    return {
      success: true,
      analytics: {
        totalTasks: totalTaskCount,
        completedTasks: completedTasksCount,
        completionRate,
        goldenTimeSlot,
        activityDistribution: hourDistribution,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        productivityScore: Math.round(productivityScore),
        goalsProgress,
        habitsSummary,
        activeHabitsCount,
        completedHabitLogsCount,
        habitCompletionRate,
      },
    };
  } catch (error) {
    console.error("Dashboard Error:", error);
    return { success: false, error: "خطا در دریافت اطلاعات" };
  }
}

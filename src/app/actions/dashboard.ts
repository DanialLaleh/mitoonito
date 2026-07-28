// src/app/actions/dashboard.ts (نسخه ارتقا یافته با سیستم اهداف)
"use server"

import { prisma } from "@/lib/prisma";
import { subDays, getHours } from "date-fns";

export async function getDashboardAnalytics(userId: string) {
  try {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);

    // ۱. دریافت تسک‌های ۷ روز گذشته
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        date: { gte: sevenDaysAgo, lte: today },
      },
    });

    // ۲. دریافت لاگ عادت‌های ۷ روز گذشته
    const habitLogs = await prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: { gte: sevenDaysAgo, lte: today },
      },
    });

    // ۳. محاسبات مالی کل
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    // ۴. دریافت اهداف کاربر به همراه تسک‌های متصل به هر هدف
    const goals = await prisma.goal.findMany({
      where: { userId, isCompleted: false },
      include: {
        tasks: true,
      },
    });

    const hourDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    let completedTasksCount = 0;

    tasks.forEach(task => {
      if (task.isCompleted) {
        completedTasksCount++;
        if (task.completedAt) {
          const hour = getHours(new Date(task.completedAt));
          if (hour >= 6 && hour < 12) hourDistribution.morning++;
          else if (hour >= 12 && hour < 18) hourDistribution.afternoon++;
          else if (hour >= 18 && hour < 24) hourDistribution.evening++;
          else hourDistribution.night++;
        }
      }
    });

    habitLogs.forEach(log => {
      const hour = getHours(new Date(log.date));
      if (hour >= 6 && hour < 12) hourDistribution.morning++;
      else if (hour >= 12 && hour < 18) hourDistribution.afternoon++;
      else if (hour >= 18 && hour < 24) hourDistribution.evening++;
      else hourDistribution.night++;
    });

    let goldenTimeSlot = "نامشخص";
    let maxActivity = 0;
    const slots = [
      { name: "صبح (۶ تا ۱۲)", val: hourDistribution.morning },
      { name: "ظهر و عصر (۱۲ تا ۱۸)", val: hourDistribution.afternoon },
      { name: "شب (۱۸ تا ۲۴)", val: hourDistribution.evening },
      { name: "نیمه‌شب (۲۴ تا ۶)", val: hourDistribution.night }
    ];

    slots.forEach(slot => {
      if (slot.val > maxActivity) {
        maxActivity = slot.val;
        goldenTimeSlot = slot.name;
      }
    });

    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === "income") totalIncome += t.amount;
      else if (t.type === "expense") totalExpense += t.amount;
    });

    // ۵. محاسبه درصد پیشرفت هر هدف
    const goalsProgress = goals.map(goal => {
      const totalGoalTasks = goal.tasks.length;
      const completedGoalTasks = goal.tasks.filter(t => t.isCompleted).length;
      const progressPercentage = totalGoalTasks > 0 
        ? Math.round((completedGoalTasks / totalGoalTasks) * 100) 
        : 0;

      return {
        id: goal.id,
        title: goal.title,
        progress: progressPercentage,
        totalTasks: totalGoalTasks,
        completedTasks: completedGoalTasks,
      };
    });

    // امتیازدهی پویای بهره‌وری
    const productivityScore = (completedTasksCount * 100) + (habitLogs.length * 50);

    return {
      success: true,
      analytics: {
        totalTasks: tasks.length,
        completedTasks: completedTasksCount,
        completionRate: tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0,
        goldenTimeSlot,
        activityDistribution: hourDistribution,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        productivityScore,
        goalsProgress, // ارسال اطلاعات پیشرفت اهداف
      }
    };
  } catch (error) {
    console.error("Dashboard Error:", error);
    return { success: false, error: "خطا در دریافت اطلاعات" };
  }
}

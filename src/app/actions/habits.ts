// src/app/actions/habits.ts
"use server"

import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

// تیک زدن یا برداشتن تیک یک عادت در یک روز مشخص
export async function toggleHabitLog(habitId: string, date: Date) {
  try {
    const targetDate = startOfDay(new Date(date));

    // بررسی اینکه آیا قبلاً لاگ ثبت شده یا نه
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId,
        date: targetDate,
      },
    });

    if (existingLog) {
      // اگر وجود داشت، یعنی کاربر می‌خواهد تیک را بردارد
      await prisma.habitLog.delete({
        where: { id: existingLog.id },
      });
      return { success: true, status: "removed" };
    } else {
      // ثبت لاگ جدید برای عادت (تیک زدن)
      await prisma.habitLog.create({
        data: {
          habitId,
          date: targetDate,
        },
      });
      return { success: true, status: "logged" };
    }
  } catch (error) {
    console.error("Habit Toggle Error:", error);
    return { success: false, error: "عملیات روی عادت با خطا مواجه شد" };
  }
}

// محاسبه طولانی‌ترین زنجیره (Streak) فعلی یک عادت
export async function getHabitStreak(habitId: string) {
  try {
    const logs = await prisma.habitLog.findMany({
      where: { habitId },
      orderBy: { date: "desc" },
    });

    if (logs.length === 0) return { currentStreak: 0 };

    let currentStreak = 0;
    let today = startOfDay(new Date());
    let checkDate = today;

    // بررسی زنجیره پیوسته روزها به عقب
    for (let i = 0; i < logs.length; i++) {
      const logDate = startOfDay(new Date(logs[i].date));
      const differenceInDays = Math.floor(
        (checkDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (differenceInDays === 0) {
        currentStreak++;
        checkDate = new Date(checkDate.setDate(checkDate.getDate() - 1));
      } else if (differenceInDays === 1) {
        currentStreak++;
        checkDate = logDate;
        checkDate = new Date(checkDate.setDate(checkDate.getDate() - 1));
      } else {
        break;
      }
    }

    return { currentStreak };
  } catch (error) {
    console.error("Streak calculation error:", error);
    return { currentStreak: 0 };
  }
}

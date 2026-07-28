// src/app/actions/habits.ts
"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, isSameDay, differenceInCalendarDays } from "date-fns";

type HabitFrequency = "daily" | "weekly" | "custom";

function normalizeDate(input: Date) {
  return startOfDay(new Date(input));
}

function getStreakDates(logDates: Date[]) {
  const sorted = [...logDates]
    .map((date) => normalizeDate(date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sorted.length === 0) {
    return { currentStreak: 0, lastCompletedDate: null as Date | null };
  }

  let currentStreak = 0;
  let cursor = normalizeDate(new Date());
  let firstLogMatched = false;

  for (const logDate of sorted) {
    const diff = differenceInCalendarDays(cursor, logDate);

    if (diff === 0 && !firstLogMatched) {
      currentStreak += 1;
      firstLogMatched = true;
      cursor = subDays(cursor, 1);
      continue;
    }

    if (diff === 1) {
      currentStreak += 1;
      cursor = subDays(cursor, 1);
      continue;
    }

    break;
  }

  return {
    currentStreak,
    lastCompletedDate: sorted[0] ?? null,
  };
}

export async function createHabit(input: {
  userId: string;
  title: string;
  description?: string | null;
  frequency?: HabitFrequency;
  areaId?: string | null;
}) {
  try {
    const habit = await prisma.habit.create({
      data: {
        userId: input.userId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        frequency: input.frequency || "daily",
        areaId: input.areaId || null,
      },
    });

    return { success: true, habit };
  } catch (error) {
    console.error("Create Habit Error:", error);
    return { success: false, error: "Failed to create habit" };
  }
}

export async function updateHabit(input: {
  habitId: string;
  userId: string;
  title?: string;
  description?: string | null;
  frequency?: HabitFrequency;
  areaId?: string | null;
}) {
  try {
    const habit = await prisma.habit.findFirst({
      where: {
        id: input.habitId,
        userId: input.userId,
      },
    });

    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: input.habitId },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.description !== undefined
          ? { description: input.description?.trim() || null }
          : {}),
        ...(input.frequency !== undefined ? { frequency: input.frequency } : {}),
        ...(input.areaId !== undefined ? { areaId: input.areaId || null } : {}),
      },
    });

    return { success: true, habit: updatedHabit };
  } catch (error) {
    console.error("Update Habit Error:", error);
    return { success: false, error: "Failed to update habit" };
  }
}

export async function deleteHabit(input: { habitId: string; userId: string }) {
  try {
    const habit = await prisma.habit.findFirst({
      where: {
        id: input.habitId,
        userId: input.userId,
      },
    });

    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    await prisma.habit.delete({
      where: { id: input.habitId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete Habit Error:", error);
    return { success: false, error: "Failed to delete habit" };
  }
}

export async function toggleHabitLog(input: {
  habitId: string;
  userId: string;
  date: Date;
}) {
  try {
    const targetDate = normalizeDate(input.date);

    const habit = await prisma.habit.findFirst({
      where: {
        id: input.habitId,
        userId: input.userId,
      },
    });

    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId: input.habitId,
        date: targetDate,
      },
    });

    if (existingLog) {
      await prisma.habitLog.delete({
        where: { id: existingLog.id },
      });

      return { success: true, status: "removed" as const };
    }

    const createdLog = await prisma.habitLog.create({
      data: {
        habitId: input.habitId,
        date: targetDate,
      },
    });

    return { success: true, status: "logged" as const, log: createdLog };
  } catch (error) {
    console.error("Toggle Habit Log Error:", error);
    return { success: false, error: "Failed to toggle habit log" };
  }
}

export async function getHabitStreak(input: {
  habitId: string;
  userId: string;
}) {
  try {
    const habit = await prisma.habit.findFirst({
      where: {
        id: input.habitId,
        userId: input.userId,
      },
    });

    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    const logs = await prisma.habitLog.findMany({
      where: {
        habitId: input.habitId,
      },
      select: {
        date: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    const streak = getStreakDates(logs.map((log) => log.date));

    return {
      success: true,
      currentStreak: streak.currentStreak,
      lastCompletedDate: streak.lastCompletedDate,
    };
  } catch (error) {
    console.error("Get Habit Streak Error:", error);
    return { success: false, error: "Failed to calculate streak" };
  }
}

export async function getHabitsOverview(input: {
  userId: string;
  days?: number;
}) {
  try {
    const days = input.days ?? 7;
    const today = new Date();
    const fromDate = subDays(today, days - 1);

    const habits = await prisma.habit.findMany({
      where: { userId: input.userId },
      include: {
        logs: {
          where: {
            date: {
              gte: fromDate,
              lte: today,
            },
          },
          select: {
            date: true,
          },
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const overview = habits.map((habit) => {
      const streak = getStreakDates(habit.logs.map((log) => log.date));

      return {
        id: habit.id,
        title: habit.title,
        description: habit.description,
        frequency: habit.frequency,
        completedDaysCount: habit.logs.length,
        successRate: Math.round((habit.logs.length / days) * 100),
        currentStreak: streak.currentStreak,
        lastCompletedDate: streak.lastCompletedDate,
      };
    });

    return { success: true, habits: overview };
  } catch (error) {
    console.error("Get Habits Overview Error:", error);
    return { success: false, error: "Failed to load habits overview" };
  }
}

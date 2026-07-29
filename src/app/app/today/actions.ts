"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function toggleTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  const taskId = formData.get("taskId") as string;
  const isCompleted = formData.get("isCompleted") === "true";

  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: { 
      isCompleted,
      completedAt: isCompleted ? new Date() : null 
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
}

export async function logHabitAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  const habitId = formData.get("habitId") as string;
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });

  await prisma.habitLog.create({
    data: {
      habitId,
      pointsEarned: habit?.points || 10,
      loggedAt: new Date(),
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function toggleTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  const taskId = formData.get("taskId") as string;
  const done = formData.get("done") === "true";

  await prisma.task.updateMany({
    where: {
      id: taskId,
      userId: user.id,
    },
    data: {
      done,
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
}

export async function logHabitAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  const habitId = formData.get("habitId") as string;

  await prisma.habit.updateMany({
    where: {
      id: habitId,
      userId: user.id,
    },
    data: {
      streak: {
        increment: 1,
      },
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
}

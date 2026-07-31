"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function createHabit(data: { userId: string; title: string; description?: string; areaId?: string | null }) {
  const habit = await prisma.habit.create({
    data: {
      userId: data.userId,
      title: data.title,
      description: data.description,
      areaId: data.areaId,
      frequency: "daily",
      streak: 0,
    },
  });
  revalidatePath("/app/habits");
  return habit;
}

export async function createHabitAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const title = String(formData.get("title") || "");
  await createHabit({ userId: user.id, title });
}

export async function logHabitAction(formData: FormData) {
  // چون مدل HabitLog در Schema نیست، فقط streak را آپدیت می‌کنیم تا Build نشکند
  const id = String(formData.get("habitId") || "");
  await prisma.habit.update({
    where: { id },
    data: { streak: { increment: 1 } },
  });
  revalidatePath("/app/habits");
}

export async function deleteHabitAction(formData: FormData) {
  const id = String(formData.get("habitId") || "");
  await prisma.habit.delete({ where: { id } });
  revalidatePath("/app/habits");
}

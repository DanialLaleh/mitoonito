"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

// یکپارچه‌سازی متدها برای جلوگیری از تکرار کد
export async function createTask(data: { title: string; description?: string; dueDate?: Date; areaId?: string; points?: number }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate || new Date(), // پیش‌فرض امروز
      points: data.points || 15,
      // اگر areaId در آینده اضافه شد، اینجا قابل گسترش است
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
  return task;
}

export async function toggleTaskStatus(taskId: string, isCompleted: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null, // ثبت زمان دقیق برای تحلیل ساعت طلایی
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
}

export async function deleteTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.task.delete({
    where: { id: taskId, userId: user.id },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
}

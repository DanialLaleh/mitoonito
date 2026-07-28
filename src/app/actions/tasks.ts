"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDateStr = formData.get("dueDate") as string; // فرمت: YYYY-MM-DD
  const points = parseInt(formData.get("points") as string) || 15;

  await prisma.task.create({
    data: {
      userId: user.id,
      title,
      description,
      points,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      isCompleted: false,
    },
  });

  revalidatePath("/app/tasks");
  revalidatePath("/app/dashboard");
}

export async function toggleTaskStatus(taskId: string, isCompleted: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: {
      isCompleted,
      // اگر تکمیل شد، زمان دقیق همین الان ثبت شود (برای تحلیل ساعت طلایی)
      completedAt: isCompleted ? new Date() : null,
    },
  });

  revalidatePath("/app/tasks");
  revalidatePath("/app/dashboard");
}

export async function deleteTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.task.delete({
    where: { id: taskId, userId: user.id },
  });

  revalidatePath("/app/tasks");
  revalidatePath("/app/dashboard");
}

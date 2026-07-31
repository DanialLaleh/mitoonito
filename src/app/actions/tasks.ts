"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function createTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  const title = String(formData.get("title") || "").trim();
  const dueDateRaw = String(formData.get("dueDate") || "").trim();
  const areaId = String(formData.get("areaId") || "").trim() || null;

  if (!title) {
    throw new Error("عنوان وظیفه الزامی است.");
  }

  await prisma.task.create({
    data: {
      title,
      done: false,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      userId: user.id,
      areaId,
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/goals");
  revalidatePath("/app/areas");
}

export async function deleteTaskAction(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  await prisma.task.deleteMany({
    where: {
      id: taskId,
      userId: user.id,
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
}

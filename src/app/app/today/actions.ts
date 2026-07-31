"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function toggleTaskDoneAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const taskId = String(formData.get("taskId") || "").trim();
  const done = String(formData.get("done") || "").trim() === "true";

  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const task = await prisma.task.update({
    where: {
      id: taskId,
      userId: user.id,
    },
    data: {
      done,
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/tasks");
  revalidatePath("/app/dashboard");

  return task;
}

export async function createTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const title = String(formData.get("title") || "").trim();
  const dueDateString = String(formData.get("dueDate") || "").trim();

  if (!title) {
    throw new Error("Task title is required");
  }

  const task = await prisma.task.create({
    data: {
      title,
      dueDate: dueDateString ? new Date(dueDateString) : new Date(),
      userId: user.id,
      done: false,
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/tasks");
  revalidatePath("/app/dashboard");

  return task;
}

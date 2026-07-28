"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

function normalizeString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function createGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const title = normalizeString(formData.get("title"));
  if (!title) throw new Error("عنوان هدف اجباری است");

  const description = normalizeString(formData.get("description")) || null;

  await prisma.goal.create({
    data: {
      userId: user.id,
      title,
      description,
      isCompleted: false,
    },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/today");
}

export async function updateGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const goalId = normalizeString(formData.get("goalId"));
  const title = normalizeString(formData.get("title"));
  if (!goalId) throw new Error("شناسه هدف اجباری است");
  if (!title) throw new Error("عنوان هدف اجباری است");

  const description = normalizeString(formData.get("description")) || null;

  const existing = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!existing) throw new Error("هدف یافت نشد");

  await prisma.goal.update({
    where: { id: goalId },
    data: { title, description },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
}

export async function toggleGoalCompletedAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const goalId = normalizeString(formData.get("goalId"));
  const isCompleted = formData.get("isCompleted") === "true";
  if (!goalId) throw new Error("شناسه هدف اجباری است");

  await prisma.goal.update({
    where: { id: goalId, userId: user.id },
    data: { isCompleted },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
}

export async function deleteGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const goalId = normalizeString(formData.get("goalId"));
  if (!goalId) throw new Error("شناسه هدف اجباری است");

  await prisma.goal.delete({
    where: { id: goalId, userId: user.id },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/today");
}

/** اتصال یک تسک موجود به هدف (اختیاری برای UI اهداف) */
export async function linkTaskToGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const goalId = normalizeString(formData.get("goalId"));
  const taskId = normalizeString(formData.get("taskId"));
  if (!goalId || !taskId) throw new Error("شناسه هدف و تسک اجباری است");

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!goal) throw new Error("هدف معتبر نیست");

  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: { goalId },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/today");
}

export async function createGoalTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const goalId = normalizeString(formData.get("goalId"));
  const title = normalizeString(formData.get("title"));
  if (!goalId) throw new Error("شناسه هدف اجباری است");
  if (!title) throw new Error("عنوان تسک اجباری است");

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!goal) throw new Error("هدف معتبر نیست");

  const dateStr = normalizeString(formData.get("date"));
  let taskDate = new Date();
  if (dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    taskDate = new Date(year, month - 1, day);
  }

  await prisma.task.create({
    data: {
      userId: user.id,
      goalId,
      title,
      isCompleted: false,
      date: taskDate,
      completedAt: null,
    },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/today");
}

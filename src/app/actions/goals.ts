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
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const title = normalizeString(formData.get("title"));
  if (!title) throw new Error("وارد کردن عنوان هدف الزامی است.");

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
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const goalId = normalizeString(formData.get("goalId"));
  const title = normalizeString(formData.get("title"));
  if (!goalId) throw new Error("شناسه هدف یافت نشد.");
  if (!title) throw new Error("عنوان هدف نمی‌تواند خالی باشد.");

  const description = normalizeString(formData.get("description")) || null;

  const existingGoal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!existingGoal) throw new Error("هدف مورد نظر یافت نشد یا دسترسی مجاز نیست.");

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      title,
      description,
    },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
}

export async function toggleGoalCompletedAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const goalId = normalizeString(formData.get("goalId"));
  const isCompleted = formData.get("isCompleted") === "true";
  if (!goalId) throw new Error("شناسه هدف یافت نشد.");

  const existingGoal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!existingGoal) throw new Error("هدف مورد نظر یافت نشد یا دسترسی مجاز نیست.");

  await prisma.goal.update({
    where: { id: goalId },
    data: { isCompleted },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
}

export async function deleteGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const goalId = normalizeString(formData.get("goalId"));
  if (!goalId) throw new Error("شناسه هدف یافت نشد.");

  const existingGoal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!existingGoal) throw new Error("هدف مورد نظر یافت نشد یا دسترسی مجاز نیست.");

  await prisma.goal.delete({
    where: { id: goalId },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/today");
}

export async function linkTaskToGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const taskId = normalizeString(formData.get("taskId"));
  const goalId = normalizeString(formData.get("goalId"));

  if (!taskId) throw new Error("شناسه تسک یافت نشد.");
  if (!goalId) throw new Error("شناسه هدف یافت نشد.");

  const [task, goal] = await Promise.all([
    prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    }),
    prisma.goal.findFirst({
      where: { id: goalId, userId: user.id },
    }),
  ]);

  if (!task) throw new Error("تسک مورد نظر یافت نشد.");
  if (!goal) throw new Error("هدف مورد نظر یافت نشد.");

  await prisma.task.update({
    where: { id: taskId },
    data: {
      goalId,
    },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
}

export async function createGoalTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const goalId = normalizeString(formData.get("goalId"));
  const title = normalizeString(formData.get("title"));
  const description = normalizeString(formData.get("description")) || null;
  const dateValue = normalizeString(formData.get("date"));

  if (!goalId) throw new Error("شناسه هدف یافت نشد.");
  if (!title) throw new Error("عنوان تسک الزامی است.");

  const existingGoal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!existingGoal) throw new Error("هدف مورد نظر یافت نشد یا دسترسی مجاز نیست.");

  const dueDate = dateValue ? new Date(dateValue) : null;

  await prisma.task.create({
    data: {
      userId: user.id,
      goalId,
      title,
      description,
      dueDate,
      isCompleted: false,
      completedAt: null,
    },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/today");
}

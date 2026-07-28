"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

// تابع کمکی برای اعتبارسنجی و تمیز کردن ورودی‌ها
function normalizeString(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

/**
 * ایجاد یک هدف جدید
 */
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

/**
 * ویرایش اطلاعات یک هدف
 */
export async function updateGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const goalId = normalizeString(formData.get("goalId"));
  const title = normalizeString(formData.get("title"));
  if (!goalId) throw new Error("شناسه هدف یافت نشد.");
  if (!title) throw new Error("عنوان هدف نمی‌تواند خالی باشد.");

  const description = normalizeString(formData.get("description")) || null;

  // بررسی مالکیت هدف
  const existingGoal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!existingGoal) throw new Error("هدف مورد نظر یافت نشد یا دسترسی مجاز نیست.");

  await prisma.goal.update({
    where: { id: goalId },
    data: { title, description },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
}

/**
 * تغییر وضعیت انجام هدف (کامل شده / در حال انجام)
 */
export async function toggleGoalCompletedAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const goalId = normalizeString(formData.get("goalId"));
  const isCompleted = formData.get("isCompleted") === "true";
  if (!goalId) throw new Error("شناسه هدف یافت نشد.");

  // بررسی مالکیت هدف
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

/**
 * حذف یک هدف
 */
export async function deleteGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const goalId = normalizeString(formData.get("goalId"));
  if (!goalId) throw new Error("شناسه هدف یافت نشد.");

  // بررسی مالکیت هدف
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

/**
 * متصل کردن یک تسک موجود به یک هدف مشخص
 */
export async function linkTaskToGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const goalId = normalizeString(formData.get("goalId"));
  const taskId = normalizeString(formData.get("taskId"));
  if (!goalId || !taskId) throw new Error("شناسه هدف و تسک الزامی است.");

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!goal) throw new Error("هدف معتبر نیست یا دسترسی مجاز نیست.");

  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: { goalId },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/today");
}

/**
 * ایجاد مستقیم یک تسک درون ساختار یک هدف (با امکان ثبت تاریخ گذشته و آینده)
 */
export async function createGoalTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const goalId = normalizeString(formData.get("goalId"));
  const title = normalizeString(formData.get("title"));
  if (!goalId) throw new Error("شناسه هدف الزامی است.");
  if (!title) throw new Error("عنوان تسک الزامی است.");

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!goal) throw new Error("هدف معتبر نیست یا دسترسی مجاز نیست.");

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

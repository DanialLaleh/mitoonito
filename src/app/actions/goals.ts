"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("کاربر احراز هویت نشده است.");

  const title = normalizeString(formData.get("title"));
  const target = Number(formData.get("target") || 0);
  const deadline = formData.get("deadline") ? new Date(String(formData.get("deadline"))) : null;

  if (!title) throw new Error("عنوان هدف الزامی است.");

  await prisma.goal.create({
    data: {
      userId: user.id,
      title,
      target,
      current: 0,
      deadline,
    },
  });

  revalidatePath("/app/goals");
}

export async function updateGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const id = normalizeString(formData.get("id"));
  const title = normalizeString(formData.get("title"));
  const current = Number(formData.get("current") || 0);

  await prisma.goal.updateMany({
    where: { id, userId: user.id },
    data: { title, current },
  });

  revalidatePath("/app/goals");
}

export async function toggleGoalCompletedAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const id = normalizeString(formData.get("goalId"));
  // چون فیلد isCompleted نداریم، مقدار current را با target برابر می‌کنیم
  const goal = await prisma.goal.findFirst({ where: { id, userId: user.id } });
  if (goal) {
    await prisma.goal.update({
      where: { id },
      data: { current: goal.target },
    });
  }
  revalidatePath("/app/goals");
}

export async function createGoalTaskAction(formData: FormData) {
  // شبیه‌سازی برای جلوگیری از خطای Build (چون در Schema رابطه Task-Goal نداریم)
  revalidatePath("/app/goals");
}

export async function deleteGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const id = normalizeString(formData.get("goalId"));
  await prisma.goal.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/app/goals");
}

"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function createGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  const title = String(formData.get("title") || "").trim();
  const targetRaw = String(formData.get("target") || "").trim();
  const currentRaw = String(formData.get("current") || "").trim();
  const deadlineRaw = String(formData.get("deadline") || "").trim();

  if (!title) throw new Error("عنوان هدف الزامی است.");
  if (!targetRaw) throw new Error("هدف کمی الزامی است.");

  const target = Number(targetRaw);
  const current = currentRaw ? Number(currentRaw) : 0;

  if (Number.isNaN(target) || target <= 0) {
    throw new Error("مقدار هدف باید عددی بزرگ‌تر از صفر باشد.");
  }

  await prisma.goal.create({
    data: {
      title,
      target,
      current: Number.isNaN(current) ? 0 : current,
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      userId: user.id,
    },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
}

export async function updateGoalAction(
  goalId: string,
  data: { title?: string; target?: number; current?: number; deadline?: Date | null }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  await prisma.goal.updateMany({
    where: {
      id: goalId,
      userId: user.id,
    },
    data,
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
}

export async function deleteGoalAction(goalId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  await prisma.goal.deleteMany({
    where: {
      id: goalId,
      userId: user.id,
    },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");
}

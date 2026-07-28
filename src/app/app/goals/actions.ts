"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { planLimits } from "@/lib/design-tokens";

function normalizeString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function createGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const title = normalizeString(formData.get("title"));
  const description = normalizeString(formData.get("description"));
  const targetDateStr = normalizeString(formData.get("targetDate"));

  if (!title) throw new Error("عنوان هدف اجباری است");

  // بررسی محدودیت تعداد اهداف فعال برای کاربر بر اساس پلن
  const currentCount = await prisma.goal.count({
    where: { userId: user.id },
  });

  const limit = planLimits[user.plan as keyof typeof planLimits]?.maxGoals ?? 0;

  if (currentCount >= limit) {
    throw new Error(`شما به سقف مجاز ثبت ${limit} هدف در پلن ${user.plan} رسیده‌اید.`);
  }

  await prisma.goal.create({
    data: {
      userId: user.id,
      title,
      description: description || null,
      targetDate: targetDateStr ? new Date(targetDateStr) : null,
      isCompleted: false,
    },
  });

  revalidatePath("/app/goals");
}

export async function toggleGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const goalId = normalizeString(formData.get("goalId"));
  const isCompleted = formData.get("isCompleted") === "true";

  if (!goalId) throw new Error("شناسه هدف مشخص نیست");

  await prisma.goal.update({
    where: { id: goalId, userId: user.id },
    data: { isCompleted },
  });

  revalidatePath("/app/goals");
}

export async function deleteGoalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const goalId = normalizeString(formData.get("goalId"));
  if (!goalId) throw new Error("شناسه هدف مشخص نیست");

  await prisma.goal.delete({
    where: { id: goalId, userId: user.id },
  });

  revalidatePath("/app/goals");
}

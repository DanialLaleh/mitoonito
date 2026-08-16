"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { goalSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string } | null;

const FREE_GOAL_LIMIT = 10;

export async function createGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    areaId: formData.get("areaId") || undefined,
    targetValue: formData.get("targetValue"),
    unit: formData.get("unit") || undefined,
    deadline: formData.get("deadline") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "کاربر یافت نشد" };

  if (user.plan === "FREE") {
    const count = await prisma.goal.count({
      where: { userId: session.userId },
    });
    if (count >= FREE_GOAL_LIMIT) {
      return {
        error: `در پلن رایگان حداکثر ${FREE_GOAL_LIMIT} هدف فعال می‌توانید داشته باشید. برای ادامه، به پلن ویژه ارتقا دهید.`,
      };
    }
  }

  await prisma.goal.create({
    data: {
      userId: session.userId,
      areaId: parsed.data.areaId || null,
      title: parsed.data.title,
      targetValue: parsed.data.targetValue,
      unit: parsed.data.unit,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    },
  });

  revalidatePath("/goals");
  return null;
}

export async function updateGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const id = formData.get("id") as string;
  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    areaId: formData.get("areaId") || undefined,
    targetValue: formData.get("targetValue"),
    unit: formData.get("unit") || undefined,
    deadline: formData.get("deadline") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.userId)
    return { error: "دسترسی مجاز نیست" };

  await prisma.goal.update({
    where: { id },
    data: {
      title: parsed.data.title,
      areaId: parsed.data.areaId || null,
      targetValue: parsed.data.targetValue,
      unit: parsed.data.unit,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    },
  });

  revalidatePath("/goals");
  return null;
}

export async function deleteGoalAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.userId) return;

  await prisma.goal.delete({ where: { id } });
  revalidatePath("/goals");
}

export async function updateGoalProgressAction(id: string, newValue: number) {
  const session = await getSession();
  if (!session) return;

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.userId) return;

  const clamped = Math.max(0, newValue);

  await prisma.goal.update({
    where: { id },
    data: { currentValue: clamped },
  });

  revalidatePath("/goals");
}

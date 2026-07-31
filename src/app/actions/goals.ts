"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const targetRaw = String(formData.get("target") || "").trim();
  const target = Number(targetRaw);

  if (!title) {
    throw new Error("Goal title is required");
  }

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title,
      description: description || null,
      target: Number.isFinite(target) && target > 0 ? target : 100,
      current: 0,
    },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");

  return goal;
}

export async function updateGoalProgress(goalId: string, current: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const goal = await prisma.goal.update({
    where: {
      id: goalId,
      userId: user.id,
    },
    data: {
      current,
    },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");

  return goal;
}

export async function deleteGoal(goalId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const goal = await prisma.goal.delete({
    where: {
      id: goalId,
      userId: user.id,
    },
  });

  revalidatePath("/app/goals");
  revalidatePath("/app/dashboard");

  return goal;
}

"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function createReminderAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  const text = String(formData.get("text") || "").trim();
  const remindAtRaw = String(formData.get("remindAt") || "").trim();

  if (!text) throw new Error("متن یادآور الزامی است.");
  if (!remindAtRaw) throw new Error("زمان یادآور الزامی است.");

  await prisma.reminder.create({
    data: {
      text,
      remindAt: new Date(remindAtRaw),
      userId: user.id,
    },
  });

  revalidatePath("/app/reminders");
  revalidatePath("/app/dashboard");
}

export async function deleteReminderAction(reminderId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  await prisma.reminder.deleteMany({
    where: {
      id: reminderId,
      userId: user.id,
    },
  });

  revalidatePath("/app/reminders");
  revalidatePath("/app/dashboard");
}

export async function toggleReminderStatusAction(
  reminderId: string,
  _isActive: boolean
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  revalidatePath("/app/reminders");
  revalidatePath("/app/dashboard");
}

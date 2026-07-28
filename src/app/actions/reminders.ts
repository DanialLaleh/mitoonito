"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";
import { ReminderFrequency, ReminderMethod } from "@prisma/client";

/**
 * دریافت لیست تمام یادآورهای کاربر
 */
export async function getRemindersAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error("برای این عملیات باید وارد حساب خود شوید.");

  return await prisma.reminder.findMany({
    where: { userId: user.id },
    include: {
      habit: { select: { title: true } },
      task: { select: { title: true } },
    },
    orderBy: { time: "asc" },
  });
}

/**
 * ایجاد یک یادآور جدید
 */
export async function createReminderAction(data: {
  title: string;
  message?: string;
  time: string;
  frequency: ReminderFrequency;
  method: ReminderMethod;
  habitId?: string;
  taskId?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const reminder = await prisma.reminder.create({
    data: {
      ...data,
      userId: user.id,
    },
  });

  revalidatePath("/app/reminders");
  return reminder;
}

/**
 * تغییر وضعیت فعال/غیرفعال بودن یادآور
 */
export async function toggleReminderStatusAction(id: string, currentState: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.reminder.update({
    where: { id, userId: user.id },
    data: { isActive: !currentState },
  });

  revalidatePath("/app/reminders");
}

/**
 * حذف یادآور
 */
export async function deleteReminderAction(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.reminder.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/app/reminders");
}

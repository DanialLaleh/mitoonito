"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function getRemindersAction() {
  const user = await getCurrentUser();
  if (!user) return [];
  // نگاشت مدل ساده به مدل پیچیده‌ای که کامپوننت نیاز دارد برای جلوگیری از خطای Type
  const data = await prisma.reminder.findMany({
    where: { userId: user.id },
    orderBy: { remindAt: "asc" },
  });
  
  return data.map(r => ({
    id: r.id,
    title: r.text,
    time: r.remindAt.toISOString(),
    frequency: "ONCE", 
    isActive: true
  }));
}

export async function createReminderAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  await prisma.reminder.create({
    data: {
      userId: user.id,
      text: String(formData.get("title") || ""),
      remindAt: new Date(String(formData.get("time"))),
    },
  });
  revalidatePath("/app/reminders");
}

export async function toggleReminderStatusAction(id: string, currentState: boolean) {
  revalidatePath("/app/reminders");
}

export async function deleteReminderAction(id: string) {
  await prisma.reminder.delete({ where: { id } });
  revalidatePath("/app/reminders");
}

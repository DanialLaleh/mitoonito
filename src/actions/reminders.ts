"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { reminderSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string } | null;

export async function createReminderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const parsed = reminderSchema.safeParse({
    text: formData.get("text"),
    remindAt: formData.get("remindAt"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.reminder.create({
    data: {
      userId: session.userId,
      text: parsed.data.text,
      remindAt: new Date(parsed.data.remindAt),
    },
  });

  revalidatePath("/reminders");
  revalidatePath("/today");
  revalidatePath("/dashboard");
  return null;
}

export async function updateReminderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const id = formData.get("id") as string;
  const parsed = reminderSchema.safeParse({
    text: formData.get("text"),
    remindAt: formData.get("remindAt"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder || reminder.userId !== session.userId)
    return { error: "دسترسی مجاز نیست" };

  await prisma.reminder.update({
    where: { id },
    data: { text: parsed.data.text, remindAt: new Date(parsed.data.remindAt) },
  });

  revalidatePath("/reminders");
  return null;
}

export async function deleteReminderAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder || reminder.userId !== session.userId) return;

  await prisma.reminder.delete({ where: { id } });
  revalidatePath("/reminders");
  revalidatePath("/today");
  revalidatePath("/dashboard");
}

export async function toggleReminderActiveAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder || reminder.userId !== session.userId) return;

  await prisma.reminder.update({
    where: { id },
    data: { isActive: !reminder.isActive },
  });

  revalidatePath("/reminders");
}

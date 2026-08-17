"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { taskSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string } | null;

function parseLabels(input?: string): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
}

function getNextDate(date: Date, frequency: "DAILY" | "WEEKLY" | "MONTHLY") {
  const next = new Date(date);
  if (frequency === "DAILY") next.setDate(next.getDate() + 1);
  if (frequency === "WEEKLY") next.setDate(next.getDate() + 7);
  if (frequency === "MONTHLY") next.setMonth(next.getMonth() + 1);
  return next;
}

export async function createTaskAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    areaId: formData.get("areaId") || undefined,
    parentTaskId: formData.get("parentTaskId") || undefined,
    priority: formData.get("priority") || "MEDIUM",
    labels: formData.get("labels") || undefined,
    recurrenceFrequency: formData.get("recurrenceFrequency") || "NONE",
    scheduledDate: formData.get("scheduledDate"),
    dueDate: formData.get("dueDate") || undefined,
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.task.create({
    data: {
      userId: session.userId,
      areaId: parsed.data.areaId || null,
      parentTaskId: parsed.data.parentTaskId || null,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      labels: parseLabels(parsed.data.labels),
      recurrenceFrequency:
        parsed.data.recurrenceFrequency === "NONE"
          ? null
          : parsed.data.recurrenceFrequency,
      scheduledDate: new Date(parsed.data.scheduledDate),
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      estimatedMinutes: parsed.data.estimatedMinutes ?? null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/dashboard");
  return null;
}

export async function updateTaskAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const id = formData.get("id") as string;
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    areaId: formData.get("areaId") || undefined,
    parentTaskId: formData.get("parentTaskId") || undefined,
    priority: formData.get("priority") || "MEDIUM",
    labels: formData.get("labels") || undefined,
    recurrenceFrequency: formData.get("recurrenceFrequency") || "NONE",
    scheduledDate: formData.get("scheduledDate"),
    dueDate: formData.get("dueDate") || undefined,
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== session.userId)
    return { error: "دسترسی مجاز نیست" };

  await prisma.task.update({
    where: { id },
    data: {
      areaId: parsed.data.areaId || null,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      labels: parseLabels(parsed.data.labels),
      recurrenceFrequency:
        parsed.data.recurrenceFrequency === "NONE"
          ? null
          : parsed.data.recurrenceFrequency,
      scheduledDate: new Date(parsed.data.scheduledDate),
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      estimatedMinutes: parsed.data.estimatedMinutes ?? null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/dashboard");
  return null;
}

export async function deleteTaskAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== session.userId) return;

  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/dashboard");
}

export async function completeTaskAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== session.userId) return;

  await prisma.task.update({
    where: { id },
    data: { status: "DONE", completedAt: new Date() },
  });

  // اگه این وظیفه تکرارشونده بود، نمونه‌ی بعدی رو خودکار بساز
  if (task.recurrenceFrequency) {
    const nextDate = getNextDate(task.scheduledDate, task.recurrenceFrequency);
    await prisma.task.create({
      data: {
        userId: task.userId,
        areaId: task.areaId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        labels: task.labels,
        recurrenceFrequency: task.recurrenceFrequency,
        scheduledDate: nextDate,
        dueDate: task.dueDate
          ? new Date(
              nextDate.getTime() +
                (task.dueDate.getTime() - task.scheduledDate.getTime())
            )
          : null,
        estimatedMinutes: task.estimatedMinutes,
      },
    });
  }

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/dashboard");
}

export async function uncompleteTaskAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== session.userId) return;

  await prisma.task.update({
    where: { id },
    data: { status: "TODO", completedAt: null },
  });

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/dashboard");
}

export async function skipTaskAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== session.userId) return;

  await prisma.task.update({
    where: { id },
    data: { status: "SKIPPED" },
  });

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/dashboard");
}

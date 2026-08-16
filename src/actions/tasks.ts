"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { taskSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string } | null;

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
    priority: formData.get("priority") || "MEDIUM",
    scheduledDate: formData.get("scheduledDate"),
    dueDate: formData.get("dueDate") || undefined,
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.task.create({
    data: {
      userId: session.userId,
      areaId: parsed.data.areaId || null,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
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
    priority: formData.get("priority") || "MEDIUM",
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

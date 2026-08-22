"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  transactionSchema,
  accountSchema,
  budgetSchema,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string } | null;

function nextDateFor(date: Date, frequency: "DAILY" | "WEEKLY" | "MONTHLY") {
  const next = new Date(date);
  if (frequency === "DAILY") next.setDate(next.getDate() + 1);
  if (frequency === "WEEKLY") next.setDate(next.getDate() + 7);
  if (frequency === "MONTHLY") next.setMonth(next.getMonth() + 1);
  return next;
}

// تراکنش‌های تکرارشونده‌ای که موعدشون رسیده رو خودکار می‌سازه
export async function ensureRecurringTransactions(userId: string) {
  const recurring = await prisma.transaction.findMany({
    where: { userId, isRecurring: true, recurrenceFrequency: { not: null } },
    orderBy: { date: "desc" },
  });

  const latestByKey = new Map<string, (typeof recurring)[number]>();
  for (const t of recurring) {
    const key = `${t.type}|${t.category}|${t.accountId ?? ""}|${t.amount}|${
      t.recurrenceFrequency
    }`;
    if (!latestByKey.has(key)) latestByKey.set(key, t);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const t of latestByKey.values()) {
    if (!t.recurrenceFrequency) continue;
    let next = nextDateFor(t.date, t.recurrenceFrequency);
    let guard = 0;
    while (next <= today && guard < 60) {
      await prisma.transaction.create({
        data: {
          userId,
          accountId: t.accountId,
          type: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description,
          date: new Date(next),
          isRecurring: true,
          recurrenceFrequency: t.recurrenceFrequency,
        },
      });
      next = nextDateFor(next, t.recurrenceFrequency);
      guard++;
    }
  }
}

export async function createTransactionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const parsed = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description") || undefined,
    date: formData.get("date"),
    accountId: formData.get("accountId") || undefined,
    isRecurring: formData.get("isRecurring") === "on",
    recurrenceFrequency: formData.get("recurrenceFrequency") || "NONE",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.transaction.create({
    data: {
      userId: session.userId,
      accountId: parsed.data.accountId || null,
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      description: parsed.data.description,
      date: new Date(parsed.data.date),
      isRecurring: parsed.data.isRecurring ?? false,
      recurrenceFrequency:
        parsed.data.recurrenceFrequency === "NONE"
          ? null
          : parsed.data.recurrenceFrequency,
    },
  });

  revalidatePath("/finances");
  revalidatePath("/dashboard");
  return null;
}

export async function updateTransactionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const id = formData.get("id") as string;
  const parsed = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description") || undefined,
    date: formData.get("date"),
    accountId: formData.get("accountId") || undefined,
    isRecurring: formData.get("isRecurring") === "on",
    recurrenceFrequency: formData.get("recurrenceFrequency") || "NONE",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction || transaction.userId !== session.userId)
    return { error: "دسترسی مجاز نیست" };

  await prisma.transaction.update({
    where: { id },
    data: {
      accountId: parsed.data.accountId || null,
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      description: parsed.data.description,
      date: new Date(parsed.data.date),
      isRecurring: parsed.data.isRecurring ?? false,
      recurrenceFrequency:
        parsed.data.recurrenceFrequency === "NONE"
          ? null
          : parsed.data.recurrenceFrequency,
    },
  });

  revalidatePath("/finances");
  revalidatePath("/dashboard");
  return null;
}

export async function deleteTransactionAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction || transaction.userId !== session.userId) return;

  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/finances");
  revalidatePath("/dashboard");
}

// --- حساب‌ها ---

export async function createAccountAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const parsed = accountSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.account.create({
    data: { userId: session.userId, name: parsed.data.name },
  });

  revalidatePath("/finances");
  return null;
}

export async function deleteAccountAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const account = await prisma.account.findUnique({ where: { id } });
  if (!account || account.userId !== session.userId) return;

  await prisma.account.delete({ where: { id } });
  revalidatePath("/finances");
}

// --- بودجه‌ها ---

export async function upsertBudgetAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const parsed = budgetSchema.safeParse({
    category: formData.get("category"),
    monthlyLimit: formData.get("monthlyLimit"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.budget.upsert({
    where: {
      userId_category: {
        userId: session.userId,
        category: parsed.data.category,
      },
    },
    update: { monthlyLimit: parsed.data.monthlyLimit },
    create: {
      userId: session.userId,
      category: parsed.data.category,
      monthlyLimit: parsed.data.monthlyLimit,
    },
  });

  revalidatePath("/finances");
  return null;
}

export async function deleteBudgetAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const budget = await prisma.budget.findUnique({ where: { id } });
  if (!budget || budget.userId !== session.userId) return;

  await prisma.budget.delete({ where: { id } });
  revalidatePath("/finances");
}

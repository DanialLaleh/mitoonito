"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { transactionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string } | null;

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
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.transaction.create({
    data: {
      userId: session.userId,
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      description: parsed.data.description,
      date: new Date(parsed.data.date),
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
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction || transaction.userId !== session.userId)
    return { error: "دسترسی مجاز نیست" };

  await prisma.transaction.update({
    where: { id },
    data: {
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      description: parsed.data.description,
      date: new Date(parsed.data.date),
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

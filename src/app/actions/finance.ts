"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function createTransactionAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const amount = Number(formData.get("amount") || 0);
  const type = String(formData.get("type") || "EXPENSE");
  const category = String(formData.get("category") || "General");

  await prisma.transaction.create({
    data: {
      userId: user.id,
      amount,
      type,
      category,
      date: new Date(),
    },
  });

  revalidatePath("/app/finances");
}

export async function createTransaction(data: any) {
  await prisma.transaction.create({ data });
  revalidatePath("/app/finances");
}

"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTransaction(data: {
  userId: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  date?: Date;
}) {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        category: data.category,
        description: data.description,
        date: data.date || new Date(),
      },
    });

    revalidatePath("/app/finance");
    revalidatePath("/app/dashboard");
    return { success: true, transaction };
  } catch (error) {
    return { success: false, error: "خطا در ثبت تراکنش" };
  }
}

export async function getFinanceSummary(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  const totalIncome = transactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions,
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense
  };
}

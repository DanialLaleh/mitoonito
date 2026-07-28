"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

function normalizeString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function createTransactionAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const amount = parseFloat(normalizeString(formData.get("amount")));
  const type = normalizeString(formData.get("type")); // INCOME or EXPENSE
  const category = normalizeString(formData.get("category"));
  const description = normalizeString(formData.get("description"));

  if (isNaN(amount) || amount <= 0) throw new Error("مبلغ نامعتبر است");
  if (!category) throw new Error("دسته‌بندی اجباری است");

  await prisma.transaction.create({
    data: {
      userId: user.id,
      amount,
      type,
      category,
      description: description || null,
      date: new Date(),
    },
  });

  revalidatePath("/app/finances");
}

export async function deleteTransactionAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const id = normalizeString(formData.get("id"));
  if (!id) throw new Error("شناسه تراکنش مشخص نیست");

  await prisma.transaction.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/app/finances");
}

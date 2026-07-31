"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function createReminderAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  const text =

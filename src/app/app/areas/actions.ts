"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function createAreaAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  const title = String(formData.get("title") || "").trim();
  const icon = String(formData.get("icon") || "circle").trim();
  const color = String(formData.get("color") || "").trim() || null;
  const sortOrderRaw = String(formData.get("sortOrder") || "0").trim();

  if (!title) {
    throw new Error("عنوان بخش الزامی است.");
  }

  await prisma.area.create({
    data: {
      name: title,
      icon,
      color,
      sortOrder: Number(sortOrderRaw) || 0,
      userId: user.id,
    },
  });

  revalidatePath("/app/areas");
  revalidatePath("/app/dashboard");
}

export async function deleteAreaAction(areaId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("عدم دسترسی");

  await prisma.area.deleteMany({
    where: {
      id: areaId,
      userId: user.id,
    },
  });

  revalidatePath("/app/areas");
  revalidatePath("/app/dashboard");
}

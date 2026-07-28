"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

function normalizeString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function createTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const title = normalizeString(formData.get("title"));
  const areaId = normalizeString(formData.get("areaId"));

  if (!title) throw new Error("عنوان تسک اجباری است");

  // چک کردن وجود حوزه در صورت انتخاب
  if (areaId) {
    const area = await prisma.area.findFirst({
      where: { id: areaId, userId: user.id },
    });
    if (!area) throw new Error("حوزه انتخاب شده معتبر نیست");
  }

  // تسک‌های امروز به صورت پیش‌فرض با تاریخ شمسی/میلادی امروز ثبت می‌شوند
  await prisma.task.create({
    data: {
      userId: user.id,
      title,
      areaId: areaId || null,
      isCompleted: false,
      date: new Date(), // ثبت برای امروز
    },
  });

  revalidatePath("/app/today");
}

export async function toggleTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const taskId = normalizeString(formData.get("taskId"));
  const isCompleted = formData.get("isCompleted") === "true";

  if (!taskId) throw new Error("شناسه تسک اجباری است");

  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: { isCompleted },
  });

  revalidatePath("/app/today");
}

export async function deleteTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const taskId = normalizeString(formData.get("taskId"));
  if (!taskId) throw new Error("شناسه تسک اجباری است");

  await prisma.task.delete({
    where: { id: taskId, userId: user.id },
  });

  revalidatePath("/app/today");
}

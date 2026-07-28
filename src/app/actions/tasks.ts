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
  const dateStr = normalizeString(formData.get("date")); // YYYY-MM-DD
  const timeStr = normalizeString(formData.get("time")); // HH:mm

  if (!title) throw new Error("عنوان تسک اجباری است");

  // ترکیب تاریخ و ساعت برای ثبت زمان دقیق
  let taskDate = new Date(); // پیش‌فرض امروز
  if (dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    taskDate.setFullYear(year, month - 1, day);
  }
  
  if (timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    taskDate.setHours(hours, minutes, 0, 0);
  }

  if (areaId) {
    const area = await prisma.area.findFirst({
      where: { id: areaId, userId: user.id },
    });
    if (!area) throw new Error("حوزه انتخاب شده معتبر نیست");
  }

  await prisma.task.create({
    data: {
      userId: user.id,
      title,
      areaId: areaId || null,
      isCompleted: false,
      date: taskDate,
      // اگر کاربر ساعتی وارد کرده باشد، فرض می‌کنیم کار در همان لحظه انجام شده (برای تسک‌های گذشته)
      completedAt: timeStr ? taskDate : null,
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
}

export async function toggleTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const taskId = normalizeString(formData.get("taskId"));
  const isCompleted = formData.get("isCompleted") === "true";

  if (!taskId) throw new Error("شناسه تسک اجباری است");

  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: { 
      isCompleted,
      completedAt: isCompleted ? new Date() : null 
    },
  });

  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
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
  revalidatePath("/app/dashboard");
}

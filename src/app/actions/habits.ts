"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

function normalizeString(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

/**
 * ایجاد یک عادت جدید
 */
export async function createHabitAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const title = normalizeString(formData.get("title"));
  if (!title) throw new Error("عنوان عادت اجباری است");

  await prisma.habit.create({
    data: {
      userId: user.id,
      title,
    },
  });

  revalidatePath("/app/habits");
  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
}

/**
 * ثبت انجام شدن یک عادت (Log)
 * این بخش قلب تپنده گیمیفیکیشن در عادت‌هاست
 */
export async function logHabitAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const habitId = normalizeString(formData.get("habitId"));
  const dateStr = normalizeString(formData.get("date")); // فرمت YYYY-MM-DD
  
  if (!habitId) throw new Error("شناسه عادت یافت نشد");

  // تنظیم تاریخ لاگ (اگر تاریخ ارسال نشود، امروز در نظر گرفته می‌شود)
  let logDate = new Date();
  if (dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    logDate = new Date(year, month - 1, day);
  }
  
  // شروع و پایان آن روز برای جلوگیری از ثبت تکراری در یک روز
  const startOfDay = new Date(logDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(logDate.setHours(23, 59, 59, 999));

  const existingLog = await prisma.habitLog.findFirst({
    where: {
      habitId,
      loggedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  if (existingLog) {
    // اگر قبلاً ثبت شده، آن را حذف کن (Toggle)
    await prisma.habitLog.delete({
      where: { id: existingLog.id },
    });
  } else {
    // ثبت لاگ جدید برای عادت
    await prisma.habitLog.create({
      data: {
        habitId,
        loggedAt: startOfDay, // ذخیره در ابتدای روز برای یکپارچگی تحلیل‌ها
      },
    });
  }

  revalidatePath("/app/habits");
  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
}

/**
 * حذف یک عادت و تمام لاگ‌های مربوط به آن
 */
export async function deleteHabitAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const habitId = normalizeString(formData.get("habitId"));
  if (!habitId) throw new Error("شناسه عادت یافت نشد");

  // حذف لاگ‌ها ابتدا برای رعایت سلامت دیتابیس (اگر Cascade تنظیم نشده باشد)
  await prisma.habitLog.deleteMany({
    where: { habitId },
  });

  await prisma.habit.delete({
    where: { id: habitId, userId: user.id },
  });

  revalidatePath("/app/habits");
  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
}

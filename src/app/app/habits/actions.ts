"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { planLimits } from "@/lib/design-tokens";

function normalizeString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function createHabitAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const title = normalizeString(formData.get("title"));
  const frequency = normalizeString(formData.get("frequency")) || "DAILY";

  if (!title) throw new Error("عنوان عادت اجباری است");

  // بررسی محدودیت تعداد عادت‌های کاربر بر اساس پلن
  const currentCount = await prisma.habit.count({
    where: { userId: user.id },
  });

  const limit = planLimits[user.plan as keyof typeof planLimits]?.maxHabits ?? 0;

  if (currentCount >= limit) {
    throw new Error(`شما به سقف مجاز ثبت ${limit} عادت در پلن ${user.plan} رسیده‌اید.`);
  }

  await prisma.habit.create({
    data: {
      userId: user.id,
      title,
      frequency,
    },
  });

  revalidatePath("/app/habits");
}

export async function toggleHabitLogAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const habitId = normalizeString(formData.get("habitId"));
  if (!habitId) throw new Error("شناسه عادت مشخص نیست");

  // تاریخ امروز بدون زمان جهت ثبت در لاگ
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // بررسی اینکه آیا قبلاً لاگی برای امروز ثبت شده است یا خیر
  const existingLog = await prisma.habitLog.findFirst({
    where: {
      habitId,
      date: today,
    },
  });

  if (existingLog) {
    // اگر از قبل ثبت شده بود، یعنی کاربر می‌خواهد آن را لغو (Uncheck) کند
    await prisma.habitLog.delete({
      where: { id: existingLog.id },
    });
  } else {
    // در غیر این صورت، لاگ انجام عادت برای امروز ثبت می‌شود
    await prisma.habitLog.create({
      data: {
        habitId,
        date: today,
      },
    });
  }

  revalidatePath("/app/habits");
}

export async function deleteHabitAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const habitId = normalizeString(formData.get("habitId"));
  if (!habitId) throw new Error("شناسه عادت مشخص نیست");

  await prisma.habit.delete({
    where: { id: habitId, userId: user.id },
  });

  revalidatePath("/app/habits");
}

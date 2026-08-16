"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { habitSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string } | null;

const FREE_HABIT_LIMIT = 10;

function toDateOnly(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function createHabitAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const parsed = habitSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    areaId: formData.get("areaId") || undefined,
    frequency: formData.get("frequency") || "DAILY",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "کاربر یافت نشد" };

  if (user.plan === "FREE") {
    const count = await prisma.habit.count({
      where: { userId: session.userId, isActive: true },
    });
    if (count >= FREE_HABIT_LIMIT) {
      return {
        error: `در پلن رایگان حداکثر ${FREE_HABIT_LIMIT} عادت فعال می‌توانید داشته باشید. برای ادامه، به پلن ویژه ارتقا دهید.`,
      };
    }
  }

  await prisma.habit.create({
    data: {
      userId: session.userId,
      areaId: parsed.data.areaId || null,
      title: parsed.data.title,
      description: parsed.data.description,
      frequency: parsed.data.frequency,
    },
  });

  revalidatePath("/habits");
  revalidatePath("/today");
  revalidatePath("/dashboard");
  return null;
}

export async function updateHabitAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const id = formData.get("id") as string;
  const parsed = habitSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    areaId: formData.get("areaId") || undefined,
    frequency: formData.get("frequency") || "DAILY",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit || habit.userId !== session.userId)
    return { error: "دسترسی مجاز نیست" };

  await prisma.habit.update({
    where: { id },
    data: {
      areaId: parsed.data.areaId || null,
      title: parsed.data.title,
      description: parsed.data.description,
      frequency: parsed.data.frequency,
    },
  });

  revalidatePath("/habits");
  return null;
}

export async function deleteHabitAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit || habit.userId !== session.userId) return;

  await prisma.habit.delete({ where: { id } });
  revalidatePath("/habits");
  revalidatePath("/today");
  revalidatePath("/dashboard");
}

export async function toggleHabitActiveAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit || habit.userId !== session.userId) return;

  await prisma.habit.update({
    where: { id },
    data: { isActive: !habit.isActive },
  });

  revalidatePath("/habits");
}

// ثبت یا لغو انجام عادت برای امروز، و محاسبه‌ی streak
export async function toggleHabitCompletionAction(habitId: string) {
  const session = await getSession();
  if (!session) return;

  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit || habit.userId !== session.userId) return;

  const today = toDateOnly(new Date());

  const existing = await prisma.habitCompletion.findUnique({
    where: { habitId_date: { habitId, date: today } },
  });

  if (existing) {
    // لغو ثبت امروز
    await prisma.habitCompletion.delete({ where: { id: existing.id } });
  } else {
    // ثبت انجام امروز
    await prisma.habitCompletion.create({
      data: { habitId, date: today },
    });
  }

  // محاسبه‌ی دوباره‌ی streak از روی تاریخچه‌ی کامل
  const completions = await prisma.habitCompletion.findMany({
    where: { habitId },
    orderBy: { date: "desc" },
  });

  let currentStreak = 0;
  const dates = completions.map((c) => toDateOnly(c.date).getTime());
  const dateSet = new Set(dates);

  const cursor = new Date(today);
  // اگر امروز ثبت نشده، از دیروز شروع کن (تا streak دیروز حفظ بشه)
  if (!dateSet.has(today.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dateSet.has(cursor.getTime())) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const longestStreak = Math.max(habit.longestStreak, currentStreak);

  await prisma.habit.update({
    where: { id: habitId },
    data: { currentStreak, longestStreak },
  });

  revalidatePath("/habits");
  revalidatePath("/today");
  revalidatePath("/dashboard");
}

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

  const daysOfWeekRaw = formData.getAll("daysOfWeek");

  const parsed = habitSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    areaId: formData.get("areaId") || undefined,
    frequency: formData.get("frequency") || "DAILY",
    daysOfWeek: daysOfWeekRaw.length > 0 ? daysOfWeekRaw : undefined,
    reminderTime: formData.get("reminderTime") || undefined,
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
      daysOfWeek: parsed.data.daysOfWeek ?? [],
      reminderTime: parsed.data.reminderTime || null,
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
  const daysOfWeekRaw = formData.getAll("daysOfWeek");

  const parsed = habitSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    areaId: formData.get("areaId") || undefined,
    frequency: formData.get("frequency") || "DAILY",
    daysOfWeek: daysOfWeekRaw.length > 0 ? daysOfWeekRaw : undefined,
    reminderTime: formData.get("reminderTime") || undefined,
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
      daysOfWeek: parsed.data.daysOfWeek ?? [],
      reminderTime: parsed.data.reminderTime || null,
    },
  });

  revalidatePath("/habits");
  revalidatePath("/today");
  revalidatePath("/dashboard");
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

// محاسبه‌ی مجدد استریک با در نظر گرفتن روزهای مشخص هفته و روزهای یخ‌زده
async function recalculateStreak(habitId: string) {
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit) return;

  const completions = await prisma.habitCompletion.findMany({
    where: { habitId },
  });
  const recordByDate = new Map<number, boolean>(); // timestamp -> isFreeze
  completions.forEach((c) => {
    recordByDate.set(toDateOnly(c.date).getTime(), c.isFreeze);
  });

  const hasSpecificDays = habit.daysOfWeek.length > 0;
  const today = toDateOnly(new Date());

  function isApplicableDay(date: Date) {
    if (!hasSpecificDays) return true;
    return habit.daysOfWeek.includes(date.getDay());
  }

  let currentStreak = 0;
  const cursor = new Date(today);

  // اگر امروز روز فعالی هست ولی هنوز ثبتی نداره، از دیروز شروع کن
  if (isApplicableDay(cursor) && !recordByDate.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  // حداکثر یک سال به عقب برمی‌گردیم تا حلقه‌ی بی‌نهایت نشه
  for (let i = 0; i < 366; i++) {
    if (isApplicableDay(cursor)) {
      if (recordByDate.has(cursor.getTime())) {
        currentStreak++;
      } else {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  const longestStreak = Math.max(habit.longestStreak, currentStreak);

  await prisma.habit.update({
    where: { id: habitId },
    data: { currentStreak, longestStreak },
  });
}

// ثبت یا لغو انجام عادت برای امروز
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
    await prisma.habitCompletion.delete({ where: { id: existing.id } });
  } else {
    await prisma.habitCompletion.create({
      data: { habitId, date: today, isFreeze: false },
    });
  }

  await recalculateStreak(habitId);

  revalidatePath("/habits");
  revalidatePath("/today");
  revalidatePath("/dashboard");
}

// یخ‌زدن استریک امروز (به‌جای انجام واقعی)
export async function freezeHabitTodayAction(habitId: string) {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit || habit.userId !== session.userId)
    return { error: "دسترسی مجاز نیست" };

  if (habit.freezesUsed >= habit.freezesAvailable) {
    return { error: "سهمیه‌ی یخ‌زدن استریک این عادت تموم شده" };
  }

  const today = toDateOnly(new Date());

  const existing = await prisma.habitCompletion.findUnique({
    where: { habitId_date: { habitId, date: today } },
  });

  if (existing) {
    return { error: "امروز قبلاً برای این عادت ثبتی داشتی" };
  }

  await prisma.habitCompletion.create({
    data: { habitId, date: today, isFreeze: true },
  });

  await prisma.habit.update({
    where: { id: habitId },
    data: { freezesUsed: { increment: 1 } },
  });

  await recalculateStreak(habitId);

  revalidatePath("/habits");
  revalidatePath("/today");
  revalidatePath("/dashboard");
  return null;
}

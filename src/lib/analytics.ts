import { prisma } from "@/lib/prisma";

// ساعاتی از شبانه‌روز که کاربر بیشترین تعداد وظیفه رو در اون‌ها تکمیل کرده
export async function getGoldenHours(userId: string) {
  const completedTasks = await prisma.task.findMany({
    where: { userId, status: "DONE", completedAt: { not: null } },
    select: { completedAt: true },
  });

  if (completedTasks.length < 5) {
    return { hasEnoughData: false, hours: [] as number[] };
  }

  const hourCounts = new Array(24).fill(0);
  completedTasks.forEach((t) => {
    if (t.completedAt) {
      const hour = new Date(t.completedAt).getHours();
      hourCounts[hour]++;
    }
  });

  const maxCount = Math.max(...hourCounts);
  const topHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter((h) => h.count === maxCount && h.count > 0)
    .map((h) => h.hour)
    .slice(0, 3);

  return { hasEnoughData: true, hours: topHours };
}

export function formatHourRange(hour: number) {
  return `${hour}:۰۰ تا ${hour + 1}:۰۰`;
}

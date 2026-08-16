import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import HabitManager from "@/components/HabitManager";

function toDateOnly(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function HabitsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [habitsRaw, areas] = await Promise.all([
    prisma.habit.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.area.findMany({
      where: { userId: session.userId },
      orderBy: { order: "asc" },
    }),
  ]);

  const today = toDateOnly(new Date());

  const habits = await Promise.all(
    habitsRaw.map(async (habit) => {
      const completion = await prisma.habitCompletion.findUnique({
        where: { habitId_date: { habitId: habit.id, date: today } },
      });
      return { ...habit, completedToday: !!completion };
    })
  );

  return <HabitManager habits={habits} areas={areas} />;
}

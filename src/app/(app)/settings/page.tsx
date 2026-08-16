import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsView from "@/components/SettingsView";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  const [areasCount, goalsCount, habitsCount] = await Promise.all([
    prisma.area.count({ where: { userId: session.userId } }),
    prisma.goal.count({ where: { userId: session.userId } }),
    prisma.habit.count({ where: { userId: session.userId, isActive: true } }),
  ]);

  return (
    <SettingsView
      name={user.name}
      email={user.email}
      plan={user.plan}
      usage={{ areasCount, goalsCount, habitsCount }}
    />
  );
}

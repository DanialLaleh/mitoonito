import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import GoalManager from "@/components/GoalManager";

export default async function GoalsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [goals, areas] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.area.findMany({
      where: { userId: session.userId },
      orderBy: { order: "asc" },
    }),
  ]);

  return <GoalManager goals={goals} areas={areas} />;
}

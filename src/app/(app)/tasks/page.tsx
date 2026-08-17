import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TaskManager from "@/components/TaskManager";

export default async function TasksPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [tasks, areas] = await Promise.all([
    prisma.task.findMany({
      where: { userId: session.userId, parentTaskId: null },
      orderBy: { scheduledDate: "asc" },
      include: {
        subtasks: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.area.findMany({
      where: { userId: session.userId },
      orderBy: { order: "asc" },
    }),
  ]);

  return <TaskManager tasks={tasks} areas={areas} />;
}

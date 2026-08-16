import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReminderManager from "@/components/ReminderManager";

export default async function RemindersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.userId },
    orderBy: { remindAt: "asc" },
  });

  return <ReminderManager reminders={reminders} />;
}

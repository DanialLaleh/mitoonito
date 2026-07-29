import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function AreasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: { tasks: true }
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#434345]">حوزه‌های تمرکز</h1>
      <div className="grid gap-4">
        {goals.map(goal => (
          <div key={goal.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-[#50B848]">{goal.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{goal.tasks.length} تسک مرتبط</p>
          </div>
        ))}
      </div>
    </div>
  );
}

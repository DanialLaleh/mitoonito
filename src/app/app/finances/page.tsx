import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function FinancesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" }
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#434345]">امور مالی</h1>
      <div className="space-y-3">
        {transactions.map(t => (
          <div key={t.id} className="flex justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <p className="font-medium text-[#434345]">{t.category}</p>
              <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString("fa-IR")}</p>
            </div>
            <span className={t.type === "INCOME" ? "text-[#50B848]" : "text-red-500"}>
              {t.type === "INCOME" ? "+" : "-"}{t.amount.toLocaleString("fa-IR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

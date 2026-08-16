import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import FinanceManager from "@/components/FinanceManager";

export default async function FinancesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.userId },
    orderBy: { date: "desc" },
  });

  return <FinanceManager transactions={transactions} />;
}

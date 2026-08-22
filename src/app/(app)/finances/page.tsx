import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import FinanceManager from "@/components/FinanceManager";
import { ensureRecurringTransactions } from "@/actions/finances";

export default async function FinancesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await ensureRecurringTransactions(session.userId);

  const [transactions, accounts, budgets] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.userId },
      orderBy: { date: "desc" },
    }),
    prisma.account.findMany({
      where: { userId: session.userId },
      orderBy: { order: "asc" },
    }),
    prisma.budget.findMany({
      where: { userId: session.userId },
    }),
  ]);

  return (
    <FinanceManager
      transactions={transactions}
      accounts={accounts}
      budgets={budgets}
    />
  );
}

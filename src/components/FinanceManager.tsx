"use client";

import { useActionState, useState } from "react";
import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
  createAccountAction,
  deleteAccountAction,
  upsertBudgetAction,
  deleteBudgetAction,
  type ActionState,
} from "@/actions/finances";
import PersianDatePicker from "@/components/PersianDatePicker";
import FinanceTrendChart from "@/components/FinanceTrendChart";
import {
  Trash2,
  Pencil,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Repeat,
  X,
} from "lucide-react";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  description: string | null;
  date: Date;
  accountId: string | null;
  isRecurring: boolean;
  recurrenceFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | null;
};
type Account = { id: string; name: string };
type Budget = { id: string; category: string; monthlyLimit: number };

function formatToman(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "long",
  });
}

const RECURRENCE_LABEL: Record<string, string> = {
  DAILY: "هر روز",
  WEEKLY: "هر هفته",
  MONTHLY: "هر ماه",
};

export default function FinanceManager({
  transactions,
  accounts,
  budgets,
}: {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showBudgets, setShowBudgets] = useState(false);

  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  });

  const income = thisMonth
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expense = thisMonth
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const categoryBreakdown = thisMonth
    .filter((t) => t.type === "EXPENSE")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          امور مالی
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAccounts(!showAccounts)}
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
          >
            <Wallet size={15} />
            حساب‌ها
          </button>
          <button
            onClick={() => setShowBudgets(!showBudgets)}
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
          >
            بودجه‌ها
          </button>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg px-3 py-2"
            >
              <Plus size={16} />
              تراکنش جدید
            </button>
          )}
        </div>
      </div>

      {showAccounts && (
        <AccountManager
          accounts={accounts}
          onClose={() => setShowAccounts(false)}
        />
      )}
      {showBudgets && (
        <BudgetManager
          budgets={budgets}
          categoryBreakdown={categoryBreakdown}
          onClose={() => setShowBudgets(false)}
        />
      )}

      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
            درآمد این ماه
          </p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400">
            {formatToman(income)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
            هزینه این ماه
          </p>
          <p className="text-sm font-bold text-red-500 dark:text-red-400">
            {formatToman(expense)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">تراز</p>
          <p
            className={`text-sm font-bold ${
              balance >= 0
                ? "text-gray-900 dark:text-gray-100"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {formatToman(balance)}
          </p>
        </div>
      </div>

      <FinanceTrendChart transactions={transactions} />

      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-6 mt-4">
          <p className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">
            هزینه‌ها بر اساس دسته
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => (
                <div
                  key={category}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {category}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {formatToman(amount)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {showAddForm && (
        <TransactionForm
          accounts={accounts}
          onDone={() => setShowAddForm(false)}
        />
      )}

      {transactions.length === 0 && !showAddForm && (
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-16 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          هنوز تراکنشی ثبت نکردی.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {transactions.map((t) => (
          <TransactionRow key={t.id} transaction={t} accounts={accounts} />
        ))}
      </div>
    </div>
  );
}

function AccountManager({
  accounts,
  onClose,
}: {
  accounts: Account[];
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createAccountAction,
    null
  );

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          حساب‌های مالی
        </p>
        <button onClick={onClose} className="text-gray-400 dark:text-gray-500">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
          >
            {a.name}
            <button
              onClick={() => deleteAccountAction(a.id)}
              className="text-gray-400 dark:text-gray-500 hover:text-red-500"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            هنوز حسابی نساختی (مثلاً نقد، کارت بانک)
          </p>
        )}
      </div>

      <form action={formAction} className="flex items-center gap-2">
        <input
          name="name"
          placeholder="نام حساب (مثلاً: کارت بانک)"
          required
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg px-3 py-2"
        >
          افزودن
        </button>
      </form>
      {state?.error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-2">
          {state.error}
        </p>
      )}
    </div>
  );
}

function BudgetManager({
  budgets,
  categoryBreakdown,
  onClose,
}: {
  budgets: Budget[];
  categoryBreakdown: Record<string, number>;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    upsertBudgetAction,
    null
  );

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          بودجه‌بندی ماهانه
        </p>
        <button onClick={onClose} className="text-gray-400 dark:text-gray-500">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        {budgets.map((b) => {
          const spent = categoryBreakdown[b.category] ?? 0;
          const percent = Math.min(
            100,
            Math.round((spent / b.monthlyLimit) * 100)
          );
          const isOver = spent > b.monthlyLimit;
          return (
            <div key={b.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-300">
                  {b.category}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      isOver
                        ? "text-red-600 dark:text-red-400 font-medium"
                        : "text-gray-400 dark:text-gray-500"
                    }
                  >
                    {formatToman(spent)} / {formatToman(b.monthlyLimit)}
                  </span>
                  <button
                    onClick={() => deleteBudgetAction(b.id)}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    isOver ? "bg-red-500" : "bg-green-600"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            هنوز بودجه‌ای تعریف نکردی.
          </p>
        )}
      </div>

      <form action={formAction} className="grid grid-cols-2 gap-2">
        <input
          name="category"
          placeholder="دسته (مثلاً: خوراک)"
          required
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2">
          <input
            name="monthlyLimit"
            type="number"
            placeholder="سقف (تومان)"
            required
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg px-3 py-2 shrink-0"
          >
            ذخیره
          </button>
        </div>
      </form>
      {state?.error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-2">
          {state.error}
        </p>
      )}
    </div>
  );
}

function TransactionForm({
  accounts,
  onDone,
  defaultValues,
}: {
  accounts: Account[];
  onDone: () => void;
  defaultValues?: Transaction;
}) {
  const action = defaultValues
    ? updateTransactionAction
    : createTransactionAction;
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    null
  );
  const [type, setType] = useState<"INCOME" | "EXPENSE">(
    defaultValues?.type ?? "EXPENSE"
  );
  const [isRecurring, setIsRecurring] = useState(
    defaultValues?.isRecurring ?? false
  );

  return (
    <form
      action={formAction}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4 flex flex-col gap-3"
    >
      {defaultValues && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}
      <input type="hidden" name="type" value={type} />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("EXPENSE")}
          className={`rounded-lg py-2 text-sm font-medium border ${
            type === "EXPENSE"
              ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
              : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
          }`}
        >
          هزینه
        </button>
        <button
          type="button"
          onClick={() => setType("INCOME")}
          className={`rounded-lg py-2 text-sm font-medium border ${
            type === "INCOME"
              ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
              : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
          }`}
        >
          درآمد
        </button>
      </div>

      <input
        name="amount"
        type="number"
        placeholder="مبلغ (تومان)"
        defaultValue={defaultValues?.amount}
        required
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <input
        name="category"
        placeholder="دسته‌بندی (مثلاً: خوراک، حمل‌ونقل)"
        defaultValue={defaultValues?.category}
        required
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {accounts.length > 0 && (
        <select
          name="accountId"
          defaultValue={defaultValues?.accountId ?? ""}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">بدون حساب مشخص</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}

      <input
        name="description"
        placeholder="توضیح (اختیاری)"
        defaultValue={defaultValues?.description ?? ""}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <PersianDatePicker
        name="date"
        defaultValue={
          defaultValues?.date
            ? new Date(defaultValues.date).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)
        }
      />

      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <input
          type="checkbox"
          name="isRecurring"
          defaultChecked={defaultValues?.isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
        />
        تراکنش تکرارشونده
      </label>

      {isRecurring && (
        <select
          name="recurrenceFrequency"
          defaultValue={defaultValues?.recurrenceFrequency ?? "MONTHLY"}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="DAILY">هر روز</option>
          <option value="WEEKLY">هر هفته</option>
          <option value="MONTHLY">هر ماه</option>
        </select>
      )}

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2"
        >
          {isPending ? "در حال ذخیره..." : "ذخیره"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

function TransactionRow({
  transaction,
  accounts,
}: {
  transaction: Transaction;
  accounts: Account[];
}) {
  const [editing, setEditing] = useState(false);
  const isIncome = transaction.type === "INCOME";
  const account = accounts.find((a) => a.id === transaction.accountId);

  if (editing) {
    return (
      <TransactionForm
        accounts={accounts}
        defaultValues={transaction}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {isIncome ? (
          <TrendingUp
            size={16}
            className="text-green-600 dark:text-green-400 shrink-0"
          />
        ) : (
          <TrendingDown
            size={16}
            className="text-red-500 dark:text-red-400 shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
            {transaction.category}
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {formatDate(transaction.date)}
            </p>
            {account && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                · {account.name}
              </span>
            )}
            {transaction.isRecurring && transaction.recurrenceFrequency && (
              <span className="flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400">
                <Repeat size={10} />
                {RECURRENCE_LABEL[transaction.recurrenceFrequency]}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-sm font-medium ${
            isIncome
              ? "text-green-600 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatToman(transaction.amount)}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => deleteTransactionAction(transaction.id)}
          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

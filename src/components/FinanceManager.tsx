"use client";

import { useActionState, useState } from "react";
import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
  type ActionState,
} from "@/actions/finances";
import PersianDatePicker from "@/components/PersianDatePicker";
import { Trash2, Pencil, Plus, TrendingUp, TrendingDown } from "lucide-react";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  description: string | null;
  date: Date;
};

function formatToman(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "long",
  });
}

export default function FinanceManager({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);

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

      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-6">
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

      {showAddForm && <TransactionForm onDone={() => setShowAddForm(false)} />}

      {transactions.length === 0 && !showAddForm && (
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-16 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          هنوز تراکنشی ثبت نکردی.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {transactions.map((t) => (
          <TransactionRow key={t.id} transaction={t} />
        ))}
      </div>
    </div>
  );
}

function TransactionForm({
  onDone,
  defaultValues,
}: {
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

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const [editing, setEditing] = useState(false);
  const isIncome = transaction.type === "INCOME";

  if (editing) {
    return (
      <TransactionForm
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
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {formatDate(transaction.date)}
          </p>
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

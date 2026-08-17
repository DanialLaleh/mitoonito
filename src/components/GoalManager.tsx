"use client";
import { toPersianDigits } from "@/lib/format";
import { useActionState, useState } from "react";
import {
  createGoalAction,
  updateGoalAction,
  deleteGoalAction,
  updateGoalProgressAction,
  type ActionState,
} from "@/actions/goals";
import { Trash2, Pencil, Plus, Minus, PlusCircle } from "lucide-react";
import PersianDatePicker from "@/components/PersianDatePicker";
type Area = { id: string; title: string; color: string | null };
type Goal = {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string | null;
  deadline: Date | null;
  areaId: string | null;
};

export default function GoalManager({
  goals,
  areas,
}: {
  goals: Goal[];
  areas: Area[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">اهداف</h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg px-3 py-2"
          >
            <Plus size={16} />
            هدف جدید
          </button>
        )}
      </div>

      {showAddForm && (
        <GoalForm areas={areas} onDone={() => setShowAddForm(false)} />
      )}

      {goals.length === 0 && !showAddForm && (
        <div className="text-center text-gray-400 text-sm py-16 border border-dashed border-gray-200 rounded-2xl">
          هنوز هدفی نساختی. یک هدف عددی مثل «۱۰ کتاب در سال» بساز.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} areas={areas} />
        ))}
      </div>
    </div>
  );
}

function GoalForm({
  areas,
  onDone,
  defaultValues,
}: {
  areas: Area[];
  onDone: () => void;
  defaultValues?: Goal;
}) {
  const action = defaultValues ? updateGoalAction : createGoalAction;
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    null
  );

  return (
    <form
      action={formAction}
      className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex flex-col gap-3"
    >
      {defaultValues && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <input
        name="title"
        placeholder="مثلاً: ۱۰ کتاب در سال"
        defaultValue={defaultValues?.title}
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          name="targetValue"
          type="number"
          step="any"
          placeholder="مقدار هدف (مثلاً 10)"
          defaultValue={defaultValues?.targetValue}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          name="unit"
          placeholder="واحد (مثلاً کتاب)"
          defaultValue={defaultValues?.unit ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <select
        name="areaId"
        defaultValue={defaultValues?.areaId ?? ""}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">بدون حوزه</option>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>
            {a.title}
          </option>
        ))}
      </select>

      <PersianDatePicker
        name="deadline"
        defaultValue={
          defaultValues?.deadline
            ? new Date(defaultValues.deadline).toISOString().slice(0, 10)
            : undefined
        }
        placeholder="ددلاین (اختیاری)"
      />

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
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
          className="text-sm text-gray-500 px-4 py-2"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

function GoalCard({ goal, areas }: { goal: Goal; areas: Area[] }) {
  const [editing, setEditing] = useState(false);
  const percent = Math.min(
    100,
    Math.round((goal.currentValue / goal.targetValue) * 100)
  );
  const area = areas.find((a) => a.id === goal.areaId);

  if (editing) {
    return (
      <GoalForm
        areas={areas}
        defaultValues={goal}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium">{goal.title}</p>
          {area && <p className="text-xs text-gray-400 mt-0.5">{area.title}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-400 hover:text-gray-700"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => deleteGoalAction(goal.id)}
            className="p-1.5 text-gray-400 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {toPersianDigits(goal.currentValue)} /{" "}
          {toPersianDigits(goal.targetValue)} {goal.unit ?? ""} (
          {toPersianDigits(percent)}٪)
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              updateGoalProgressAction(goal.id, goal.currentValue - 1)
            }
            className="p-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() =>
              updateGoalProgressAction(goal.id, goal.currentValue + 1)
            }
            className="p-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            <PlusCircle size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

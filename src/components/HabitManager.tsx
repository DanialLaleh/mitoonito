"use client";

import { toPersianDigits } from "@/lib/format";
import { useActionState, useState } from "react";
import {
  createHabitAction,
  updateHabitAction,
  deleteHabitAction,
  toggleHabitActiveAction,
  toggleHabitCompletionAction,
  type ActionState,
} from "@/actions/habits";
import {
  Trash2,
  Pencil,
  Plus,
  Check,
  Flame,
  PauseCircle,
  PlayCircle,
} from "lucide-react";

type Area = { id: string; title: string; color: string | null };
type Habit = {
  id: string;
  title: string;
  description: string | null;
  frequency: "DAILY" | "WEEKLY";
  isActive: boolean;
  currentStreak: number;
  longestStreak: number;
  areaId: string | null;
  completedToday: boolean;
};

export default function HabitManager({
  habits,
  areas,
}: {
  habits: Habit[];
  areas: Area[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const active = habits.filter((h) => h.isActive);
  const inactive = habits.filter((h) => !h.isActive);

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">عادت‌ها</h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg px-3 py-2"
          >
            <Plus size={16} />
            عادت جدید
          </button>
        )}
      </div>

      {showAddForm && (
        <HabitForm areas={areas} onDone={() => setShowAddForm(false)} />
      )}

      {habits.length === 0 && !showAddForm && (
        <div className="text-center text-gray-400 text-sm py-16 border border-dashed border-gray-200 rounded-2xl">
          هنوز عادتی نساختی. یک عادت مثل «۱۰ دقیقه مطالعه» بساز.
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        {active.map((habit) => (
          <HabitRow key={habit.id} habit={habit} areas={areas} />
        ))}
      </div>

      {inactive.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">غیرفعال</h2>
          <div className="flex flex-col gap-2">
            {inactive.map((habit) => (
              <HabitRow key={habit.id} habit={habit} areas={areas} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HabitForm({
  areas,
  onDone,
  defaultValues,
}: {
  areas: Area[];
  onDone: () => void;
  defaultValues?: Habit;
}) {
  const action = defaultValues ? updateHabitAction : createHabitAction;
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
        placeholder="مثلاً: ۱۰ دقیقه مطالعه"
        defaultValue={defaultValues?.title}
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <textarea
        name="description"
        placeholder="توضیح (اختیاری)"
        defaultValue={defaultValues?.description ?? ""}
        rows={2}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="grid grid-cols-2 gap-2">
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

        <select
          name="frequency"
          defaultValue={defaultValues?.frequency ?? "DAILY"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="DAILY">روزانه</option>
          <option value="WEEKLY">هفتگی</option>
        </select>
      </div>

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

function HabitRow({ habit, areas }: { habit: Habit; areas: Area[] }) {
  const [editing, setEditing] = useState(false);
  const area = areas.find((a) => a.id === habit.areaId);

  if (editing) {
    return (
      <HabitForm
        areas={areas}
        defaultValues={habit}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 ${
        !habit.isActive ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() => toggleHabitCompletionAction(habit.id)}
          disabled={!habit.isActive}
          className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
            habit.completedToday
              ? "bg-green-600 border-green-600"
              : "border-gray-300"
          }`}
        >
          {habit.completedToday && <Check size={16} className="text-white" />}
        </button>

        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{habit.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {area && (
              <span className="text-xs text-gray-400">{area.title}</span>
            )}
            {habit.currentStreak > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-orange-500">
                <Flame size={12} />
                {toPersianDigits(habit.currentStreak)} روز
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => toggleHabitActiveAction(habit.id)}
          className="p-2 text-gray-400 hover:text-gray-700"
        >
          {habit.isActive ? (
            <PauseCircle size={16} />
          ) : (
            <PlayCircle size={16} />
          )}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="p-2 text-gray-400 hover:text-gray-700"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => deleteHabitAction(habit.id)}
          className="p-2 text-gray-400 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

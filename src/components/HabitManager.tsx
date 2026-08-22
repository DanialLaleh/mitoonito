"use client";

import { useActionState, useState } from "react";
import {
  createHabitAction,
  updateHabitAction,
  deleteHabitAction,
  toggleHabitActiveAction,
  toggleHabitCompletionAction,
  freezeHabitTodayAction,
  type ActionState,
} from "@/actions/habits";
import { toPersianDigits } from "@/lib/format";
import HabitHeatmap from "@/components/HabitHeatmap";
import {
  Trash2,
  Pencil,
  Plus,
  Check,
  Flame,
  PauseCircle,
  PlayCircle,
  Snowflake,
  BarChart2,
  Bell,
} from "lucide-react";

type Area = { id: string; title: string; color: string | null };
type HistoryEntry = { date: Date; isFreeze: boolean };
type Habit = {
  id: string;
  title: string;
  description: string | null;
  frequency: "DAILY" | "WEEKLY";
  daysOfWeek: number[];
  reminderTime: string | null;
  isActive: boolean;
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  freezesUsed: number;
  areaId: string | null;
  completedToday: boolean;
  history: HistoryEntry[];
};

const WEEK_DAYS = [
  { value: 6, label: "ش" },
  { value: 0, label: "ی" },
  { value: 1, label: "د" },
  { value: 2, label: "س" },
  { value: 3, label: "چ" },
  { value: 4, label: "پ" },
  { value: 5, label: "ج" },
];

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
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          عادت‌ها
        </h1>
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
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-16 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          هنوز عادتی نساختی. یک عادت مثل «۱۰ دقیقه مطالعه» بساز.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {active.map((habit) => (
          <HabitRow key={habit.id} habit={habit} areas={areas} />
        ))}
      </div>

      {inactive.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-2">
            غیرفعال
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
  const [selectedDays, setSelectedDays] = useState<number[]>(
    defaultValues?.daysOfWeek ?? []
  );

  function toggleDay(value: number) {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  }

  return (
    <form
      action={formAction}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4 flex flex-col gap-3"
    >
      {defaultValues && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}
      {selectedDays.map((d) => (
        <input key={d} type="hidden" name="daysOfWeek" value={d} />
      ))}

      <input
        name="title"
        placeholder="مثلاً: ۱۰ دقیقه مطالعه"
        defaultValue={defaultValues?.title}
        required
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <textarea
        name="description"
        placeholder="توضیح (اختیاری)"
        defaultValue={defaultValues?.description ?? ""}
        rows={2}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          name="areaId"
          defaultValue={defaultValues?.areaId ?? ""}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">بدون حوزه</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>

        <input
          name="reminderTime"
          type="time"
          defaultValue={defaultValues?.reminderTime ?? ""}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1">
          روزهای هفته (خالی = هر روز)
        </label>
        <div className="flex items-center gap-1.5">
          {WEEK_DAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleDay(d.value)}
              className={`w-8 h-8 rounded-full text-xs font-medium ${
                selectedDays.includes(d.value)
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

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

function FreezeButton({
  habitId,
  remaining,
}: {
  habitId: string;
  remaining: number;
}) {
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const result = await freezeHabitTodayAction(habitId);
    setError(result?.error ?? null);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={remaining <= 0}
        className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 disabled:opacity-40"
      >
        <Snowflake size={13} />
        یخ‌زدن ({toPersianDigits(remaining)})
      </button>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}

function HabitRow({ habit, areas }: { habit: Habit; areas: Area[] }) {
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const area = areas.find((a) => a.id === habit.areaId);
  const remainingFreezes = habit.freezesAvailable - habit.freezesUsed;

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
      className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden ${
        !habit.isActive ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => toggleHabitCompletionAction(habit.id)}
            disabled={!habit.isActive}
            className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              habit.completedToday
                ? "bg-green-600 border-green-600"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            {habit.completedToday && <Check size={16} className="text-white" />}
          </button>

          <div className="min-w-0">
            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
              {habit.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {area && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {area.title}
                </span>
              )}
              {habit.currentStreak > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-orange-500 dark:text-orange-400">
                  <Flame size={12} />
                  {toPersianDigits(habit.currentStreak)} روز
                </span>
              )}
              {habit.reminderTime && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
                  <Bell size={11} />
                  {toPersianDigits(habit.reminderTime)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => toggleHabitActiveAction(habit.id)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {habit.isActive ? (
              <PauseCircle size={16} />
            ) : (
              <PlayCircle size={16} />
            )}
          </button>
          <button
            onClick={() => setEditing(true)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => deleteHabitAction(habit.id)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-50 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
        <FreezeButton habitId={habit.id} remaining={remainingFreezes} />
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500"
        >
          <BarChart2 size={13} />
          تاریخچه
        </button>
      </div>

      {showHistory && (
        <div className="border-t border-gray-50 dark:border-gray-800 px-4 py-3">
          <HabitHeatmap history={habit.history} />
        </div>
      )}
    </div>
  );
}

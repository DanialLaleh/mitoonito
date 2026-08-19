"use client";

import { useActionState, useState } from "react";
import {
  createAreaAction,
  updateAreaAction,
  deleteAreaAction,
  type ActionState,
} from "@/actions/areas";
import { Trash2, Pencil, Plus } from "lucide-react";

type Area = {
  id: string;
  title: string;
  color: string | null;
};

const COLORS = [
  "#16a34a",
  "#22c55e",
  "#65a30d",
  "#0d9488",
  "#4b5563",
  "#111827",
];

export default function AreaManager({ areas }: { areas: Area[] }) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          حوزه‌های زندگی
        </h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg px-3 py-2"
          >
            <Plus size={16} />
            افزودن حوزه
          </button>
        )}
      </div>

      {showAddForm && <AreaForm onDone={() => setShowAddForm(false)} />}

      {areas.length === 0 && !showAddForm && (
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-16 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          هنوز هیچ حوزه‌ای نساختی. یک حوزه مثل «سلامت» یا «کار» بساز تا شروع
          کنیم.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {areas.map((area) => (
          <AreaRow key={area.id} area={area} />
        ))}
      </div>
    </div>
  );
}

function AreaForm({
  onDone,
  defaultValues,
}: {
  onDone: () => void;
  defaultValues?: Area;
}) {
  const action = defaultValues ? updateAreaAction : createAreaAction;
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    null
  );
  const [color, setColor] = useState(defaultValues?.color ?? COLORS[0]);

  return (
    <form
      action={formAction}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4 flex flex-col gap-3"
    >
      {defaultValues && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}
      <input type="hidden" name="color" value={color} />

      <input
        name="title"
        placeholder="مثلاً: سلامت"
        defaultValue={defaultValues?.title}
        required
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="flex items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full border-2 ${
              color === c
                ? "border-gray-900 dark:border-gray-100"
                : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
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

function AreaRow({ area }: { area: Area }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <AreaForm defaultValues={area} onDone={() => setEditing(false)} />;
  }

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: area.color ?? "#9ca3af" }}
        />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {area.title}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => deleteAreaAction(area.id)}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

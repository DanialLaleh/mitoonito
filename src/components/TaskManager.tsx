"use client";

import { useActionState, useState } from "react";
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  completeTaskAction,
  uncompleteTaskAction,
  skipTaskAction,
  type ActionState,
} from "@/actions/tasks";
import PersianDatePicker from "@/components/PersianDatePicker";
import { Trash2, Pencil, Plus, Check, RotateCcw, X } from "lucide-react";

type Area = { id: string; title: string; color: string | null };
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "SKIPPED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  scheduledDate: Date;
  dueDate: Date | null;
  estimatedMinutes: number | null;
  areaId: string | null;
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "کم",
  MEDIUM: "متوسط",
  HIGH: "زیاد",
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-500",
  MEDIUM: "bg-yellow-50 text-yellow-700",
  HIGH: "bg-red-50 text-red-600",
};

function toDateOnly(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function TaskManager({
  tasks,
  areas,
}: {
  tasks: Task[];
  areas: Area[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  const today = toDateOnly(new Date());
  const overdue = tasks.filter(
    (t) =>
      t.status !== "DONE" &&
      t.status !== "SKIPPED" &&
      toDateOnly(t.scheduledDate) < today
  );
  const todayTasks = tasks.filter(
    (t) => toDateOnly(t.scheduledDate).getTime() === today.getTime()
  );
  const upcoming = tasks.filter((t) => toDateOnly(t.scheduledDate) > today);

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">وظایف</h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg px-3 py-2"
          >
            <Plus size={16} />
            وظیفه جدید
          </button>
        )}
      </div>

      {showAddForm && (
        <TaskForm areas={areas} onDone={() => setShowAddForm(false)} />
      )}

      {tasks.length === 0 && !showAddForm && (
        <div className="text-center text-gray-400 text-sm py-16 border border-dashed border-gray-200 rounded-2xl">
          هنوز وظیفه‌ای نساختی.
        </div>
      )}

      {overdue.length > 0 && (
        <TaskSection
          title="عقب‌افتاده"
          tasks={overdue}
          areas={areas}
          tone="text-red-600"
        />
      )}
      {todayTasks.length > 0 && (
        <TaskSection
          title="امروز"
          tasks={todayTasks}
          areas={areas}
          tone="text-gray-900"
        />
      )}
      {upcoming.length > 0 && (
        <TaskSection
          title="آینده"
          tasks={upcoming}
          areas={areas}
          tone="text-gray-500"
        />
      )}
    </div>
  );
}

function TaskSection({
  title,
  tasks,
  areas,
  tone,
}: {
  title: string;
  tasks: Task[];
  areas: Area[];
  tone: string;
}) {
  return (
    <div className="mt-4">
      <h2 className={`text-sm font-medium mb-2 ${tone}`}>{title}</h2>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} areas={areas} />
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task, areas }: { task: Task; areas: Area[] }) {
  const [editing, setEditing] = useState(false);
  const area = areas.find((a) => a.id === task.areaId);
  const isDone = task.status === "DONE";
  const isSkipped = task.status === "SKIPPED";

  if (editing) {
    return (
      <TaskForm
        areas={areas}
        defaultValues={task}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 ${
        isDone || isSkipped ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() =>
            isDone ? uncompleteTaskAction(task.id) : completeTaskAction(task.id)
          }
          className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            isDone ? "bg-green-600 border-green-600" : "border-gray-300"
          }`}
        >
          {isDone && <Check size={12} className="text-white" />}
        </button>

        <div className="min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isDone ? "line-through" : ""
            }`}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {area && (
              <span className="text-xs text-gray-400">{area.title}</span>
            )}
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                PRIORITY_COLOR[task.priority]
              }`}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!isDone && !isSkipped && (
          <button
            onClick={() => skipTaskAction(task.id)}
            className="p-2 text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        )}
        <button
          onClick={() => setEditing(true)}
          className="p-2 text-gray-400 hover:text-gray-700"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => deleteTaskAction(task.id)}
          className="p-2 text-gray-400 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function TaskForm({
  areas,
  onDone,
  defaultValues,
}: {
  areas: Area[];
  onDone: () => void;
  defaultValues?: Task;
}) {
  const action = defaultValues ? updateTaskAction : createTaskAction;
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
        placeholder="عنوان وظیفه"
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
          name="priority"
          defaultValue={defaultValues?.priority ?? "MEDIUM"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="LOW">اولویت کم</option>
          <option value="MEDIUM">اولویت متوسط</option>
          <option value="HIGH">اولویت زیاد</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            تاریخ برنامه‌ریزی
          </label>
          <PersianDatePicker
            name="scheduledDate"
            defaultValue={
              defaultValues?.scheduledDate
                ? new Date(defaultValues.scheduledDate)
                    .toISOString()
                    .slice(0, 10)
                : new Date().toISOString().slice(0, 10)
            }
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            سررسید (اختیاری)
          </label>
          <PersianDatePicker
            name="dueDate"
            defaultValue={
              defaultValues?.dueDate
                ? new Date(defaultValues.dueDate).toISOString().slice(0, 10)
                : undefined
            }
          />
        </div>
      </div>

      <input
        name="estimatedMinutes"
        type="number"
        placeholder="زمان تخمینی (دقیقه، اختیاری)"
        defaultValue={defaultValues?.estimatedMinutes ?? ""}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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

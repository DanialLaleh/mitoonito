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
import {
  Trash2,
  Pencil,
  Plus,
  Check,
  X,
  Repeat,
  Tag,
  ChevronDown,
  ChevronUp,
  List,
  Calendar,
} from "lucide-react";
import TaskCalendarView from "@/components/TaskCalendarView";

type Area = { id: string; title: string; color: string | null };
type SubTask = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "SKIPPED";
};
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
  labels: string[];
  recurrenceFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | null;
  subtasks: SubTask[];
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

const RECURRENCE_LABEL: Record<string, string> = {
  DAILY: "هر روز",
  WEEKLY: "هر هفته",
  MONTHLY: "هر ماه",
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
  const [view, setView] = useState<"list" | "calendar">("list");

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">وظایف</h1>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-md ${
              view === "list"
                ? "bg-white shadow-sm text-green-600"
                : "text-gray-400"
            }`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`p-1.5 rounded-md ${
              view === "calendar"
                ? "bg-white shadow-sm text-green-600"
                : "text-gray-400"
            }`}
          >
            <Calendar size={16} />
          </button>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        {!showAddForm && view === "list" && (
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

      {view === "list" ? (
        <>
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
        </>
      ) : (
        <TaskCalendarView tasks={tasks} />
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
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [addingSubtask, setAddingSubtask] = useState(false);
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
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div
        className={`flex items-center justify-between px-4 py-3 ${
          isDone || isSkipped ? "opacity-50" : ""
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() =>
              isDone
                ? uncompleteTaskAction(task.id)
                : completeTaskAction(task.id)
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
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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
              {task.recurrenceFrequency && (
                <span className="flex items-center gap-0.5 text-xs text-blue-600">
                  <Repeat size={11} />
                  {RECURRENCE_LABEL[task.recurrenceFrequency]}
                </span>
              )}
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="flex items-center gap-0.5 text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded"
                >
                  <Tag size={10} />
                  {label}
                </span>
              ))}
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

      {/* زیروظیفه‌ها */}
      <div className="border-t border-gray-50 px-4 py-2">
        <button
          onClick={() => setShowSubtasks(!showSubtasks)}
          className="flex items-center gap-1 text-xs text-gray-400"
        >
          {showSubtasks ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          زیروظیفه‌ها ({task.subtasks.length})
        </button>

        {showSubtasks && (
          <div className="mt-2 flex flex-col gap-1.5 pr-4">
            {task.subtasks.map((sub) => (
              <SubtaskRow key={sub.id} subtask={sub} />
            ))}

            {addingSubtask ? (
              <SubtaskAddForm
                parentTaskId={task.id}
                scheduledDate={task.scheduledDate}
                onDone={() => setAddingSubtask(false)}
              />
            ) : (
              <button
                onClick={() => setAddingSubtask(true)}
                className="text-xs text-green-600 flex items-center gap-1 mt-1"
              >
                <Plus size={12} />
                افزودن زیروظیفه
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SubtaskRow({ subtask }: { subtask: SubTask }) {
  const isDone = subtask.status === "DONE";
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() =>
          isDone
            ? uncompleteTaskAction(subtask.id)
            : completeTaskAction(subtask.id)
        }
        className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          isDone ? "bg-green-600 border-green-600" : "border-gray-300"
        }`}
      >
        {isDone && <Check size={9} className="text-white" />}
      </button>
      <span
        className={`text-xs ${
          isDone ? "line-through text-gray-400" : "text-gray-600"
        }`}
      >
        {subtask.title}
      </span>
      <button
        onClick={() => deleteTaskAction(subtask.id)}
        className="text-gray-300 hover:text-red-500"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

function SubtaskAddForm({
  parentTaskId,
  scheduledDate,
  onDone,
}: {
  parentTaskId: string;
  scheduledDate: Date;
  onDone: () => void;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createTaskAction,
    null
  );

  return (
    <form action={formAction} className="flex items-center gap-2 mt-1">
      <input type="hidden" name="parentTaskId" value={parentTaskId} />
      <input
        type="hidden"
        name="scheduledDate"
        value={new Date(scheduledDate).toISOString().slice(0, 10)}
      />
      <input
        name="title"
        placeholder="عنوان زیروظیفه"
        required
        autoFocus
        className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
      />
      <button
        type="submit"
        disabled={isPending}
        onClick={() => setTimeout(onDone, 100)}
        className="text-xs text-green-600 font-medium"
      >
        ثبت
      </button>
      <button type="button" onClick={onDone} className="text-xs text-gray-400">
        انصراف
      </button>
      {state?.error && (
        <span className="text-xs text-red-500">{state.error}</span>
      )}
    </form>
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

      <select
        name="recurrenceFrequency"
        defaultValue={defaultValues?.recurrenceFrequency ?? "NONE"}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="NONE">بدون تکرار</option>
        <option value="DAILY">هر روز</option>
        <option value="WEEKLY">هر هفته</option>
        <option value="MONTHLY">هر ماه</option>
      </select>

      <input
        name="labels"
        placeholder="برچسب‌ها (با کاما جدا کنید، مثلاً: مهم, خانه)"
        defaultValue={defaultValues?.labels?.join(", ") ?? ""}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

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

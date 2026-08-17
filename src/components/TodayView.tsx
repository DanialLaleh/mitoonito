"use client";

import { toPersianDigits } from "@/lib/format";
import { completeTaskAction, uncompleteTaskAction } from "@/actions/tasks";
import { toggleHabitCompletionAction } from "@/actions/habits";
import { CheckCircle2, Circle, Flame, Bell, AlertCircle } from "lucide-react";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  scheduledDate: Date;
};
type Habit = {
  id: string;
  title: string;
  completedToday: boolean;
  currentStreak: number;
};
type Reminder = { id: string; text: string; remindAt: Date };

function toDateOnly(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TodayView({
  overdueTasks,
  todayTasks,
  habits,
  todayReminders,
}: {
  overdueTasks: Task[];
  todayTasks: Task[];
  habits: Habit[];
  todayReminders: Reminder[];
}) {
  const today = new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold">امروز</h1>
        <p className="text-sm text-gray-400 mt-1">{today}</p>
      </div>

      {overdueTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
            <AlertCircle size={14} />
            عقب‌افتاده ({overdueTasks.length})
          </h2>
          <div className="flex flex-col gap-2">
            {overdueTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">وظایف امروز</h2>
        {todayTasks.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-2xl">
            وظیفه‌ای برای امروز نداری
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {todayTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">
          عادت‌های امروز
        </h2>
        {habits.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-2xl">
            هنوز عادتی نساختی
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabitCompletionAction(habit.id)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                      habit.completedToday
                        ? "bg-green-600 border-green-600"
                        : "border-gray-300"
                    }`}
                  >
                    {habit.completedToday && (
                      <CheckCircle2 size={14} className="text-white" />
                    )}
                  </button>
                  <span className="text-sm">{habit.title}</span>
                </div>
                {habit.currentStreak > 0 && (
                  <span className="text-xs text-orange-500 flex items-center gap-0.5">
                    <Flame size={12} />
                    {toPersianDigits(habit.currentStreak)} روز
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {todayReminders.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-2">
            یادآورهای امروز
          </h2>
          <div className="flex flex-col gap-2">
            {todayReminders.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3"
              >
                <Bell size={15} className="text-green-600 shrink-0" />
                <span className="text-sm flex-1">{r.text}</span>
                <span className="text-xs text-gray-400">
                  {formatTime(r.remindAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskItem({ task }: { task: Task }) {
  const isDone = task.status === "DONE";
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3">
      <button
        onClick={() =>
          isDone ? uncompleteTaskAction(task.id) : completeTaskAction(task.id)
        }
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isDone ? "bg-green-600 border-green-600" : "border-gray-300"
        }`}
      >
        {isDone && <CheckCircle2 size={13} className="text-white" />}
      </button>
      <span
        className={`text-sm flex-1 ${
          isDone ? "line-through text-gray-400" : ""
        }`}
      >
        {task.title}
      </span>
      {!isDone && task.priority === "HIGH" && (
        <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
          فوری
        </span>
      )}
    </div>
  );
}

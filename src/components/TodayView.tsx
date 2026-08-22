"use client";

import { completeTaskAction, uncompleteTaskAction } from "@/actions/tasks";
import { toggleHabitCompletionAction } from "@/actions/habits";
import { toPersianDigits } from "@/lib/format";
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
  reminderTime: string | null;
};
type Reminder = { id: string; text: string; remindAt: Date };

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
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          امروز
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{today}</p>
      </div>

      {overdueTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
            <AlertCircle size={14} />
            عقب‌افتاده ({toPersianDigits(overdueTasks.length)})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {overdueTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          وظایف امروز
        </h2>
        {todayTasks.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 py-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            وظیفه‌ای برای امروز نداری
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {todayTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          عادت‌های امروز
        </h2>
        {habits.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 py-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            هنوز عادتی نساختی
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabitCompletionAction(habit.id)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                      habit.completedToday
                        ? "bg-green-600 border-green-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {habit.completedToday && (
                      <CheckCircle2 size={14} className="text-white" />
                    )}
                  </button>
                  <div>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {habit.title}
                    </span>
                    {habit.reminderTime && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        <Bell size={10} />
                        {habit.reminderTime}
                      </span>
                    )}
                  </div>
                </div>
                {habit.currentStreak > 0 && (
                  <span className="text-xs text-orange-500 dark:text-orange-400 flex items-center gap-0.5">
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
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            یادآورهای امروز
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {todayReminders.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3"
              >
                <Bell
                  size={15}
                  className="text-green-600 dark:text-green-400 shrink-0"
                />
                <span className="text-sm flex-1 text-gray-900 dark:text-gray-100">
                  {r.text}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
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
    <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3">
      <button
        onClick={() =>
          isDone ? uncompleteTaskAction(task.id) : completeTaskAction(task.id)
        }
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isDone
            ? "bg-green-600 border-green-600"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        {isDone && <CheckCircle2 size={13} className="text-white" />}
      </button>
      <span
        className={`text-sm flex-1 ${
          isDone
            ? "line-through text-gray-400 dark:text-gray-600"
            : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {task.title}
      </span>
      {!isDone && task.priority === "HIGH" && (
        <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-1.5 py-0.5 rounded">
          فوری
        </span>
      )}
    </div>
  );
}

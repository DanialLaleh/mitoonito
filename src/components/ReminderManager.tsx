"use client";

import { useActionState, useState } from "react";
import {
  createReminderAction,
  updateReminderAction,
  deleteReminderAction,
  toggleReminderActiveAction,
  type ActionState,
} from "@/actions/reminders";
import PersianDatePicker from "@/components/PersianDatePicker";
import { Trash2, Pencil, Plus, Bell, BellOff } from "lucide-react";

type Reminder = {
  id: string;
  text: string;
  remindAt: Date;
  isActive: boolean;
};

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ReminderManager({
  reminders,
}: {
  reminders: Reminder[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">یادآورها</h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg px-3 py-2"
          >
            <Plus size={16} />
            یادآور جدید
          </button>
        )}
      </div>

      {showAddForm && <ReminderForm onDone={() => setShowAddForm(false)} />}

      {reminders.length === 0 && !showAddForm && (
        <div className="text-center text-gray-400 text-sm py-16 border border-dashed border-gray-200 rounded-2xl">
          هنوز یادآوری نساختی.
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        {reminders.map((reminder) => (
          <ReminderRow key={reminder.id} reminder={reminder} />
        ))}
      </div>
    </div>
  );
}

function ReminderForm({
  onDone,
  defaultValues,
}: {
  onDone: () => void;
  defaultValues?: Reminder;
}) {
  const action = defaultValues ? updateReminderAction : createReminderAction;
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
        name="text"
        placeholder="متن یادآور"
        defaultValue={defaultValues?.text}
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <PersianDatePicker
        name="remindAt"
        defaultValue={
          defaultValues?.remindAt
            ? new Date(defaultValues.remindAt).toISOString().slice(0, 16)
            : undefined
        }
        placeholder="تاریخ و ساعت یادآوری"
        withTime
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

function ReminderRow({ reminder }: { reminder: Reminder }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ReminderForm defaultValues={reminder} onDone={() => setEditing(false)} />
    );
  }

  return (
    <div
      className={`flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 ${
        !reminder.isActive ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Bell size={16} className="text-green-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{reminder.text}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDateTime(reminder.remindAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => toggleReminderActiveAction(reminder.id)}
          className="p-2 text-gray-400 hover:text-gray-700"
        >
          {reminder.isActive ? <Bell size={16} /> : <BellOff size={16} />}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="p-2 text-gray-400 hover:text-gray-700"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => deleteReminderAction(reminder.id)}
          className="p-2 text-gray-400 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

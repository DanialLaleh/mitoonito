"use client";

import { useState, useTransition } from "react";
import AddReminderModal from "./AddReminderModal";
import {
  createReminderAction,
  deleteReminderAction,
  toggleReminderStatusAction,
} from "@/app/actions/reminders";

type ReminderItem = {
  id: string;
  text: string;
  remindAt: string | Date;
  isActive?: boolean;
};

export default function ReminderListClient({
  reminders,
}: {
  reminders: ReminderItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-darkGray">یادآورها</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-brandGreen px-4 py-2 text-sm font-bold text-white"
        >
          + یادآور جدید
        </button>
      </div>

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
            هنوز یادآوری ثبت نشده است.
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div>
                <p className="font-medium text-darkGray">{reminder.text}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Intl.DateTimeFormat("fa-IR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(reminder.remindAt))}
                </p>
              </div>

              <button
                onClick={() =>
                  startTransition(async () => {
                    await toggleReminderStatusAction(reminder.id, !reminder.isActive);
                  })
                }
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-darkGray"
              >
                {reminder.isActive ? "فعال" : "غیرفعال"}
              </button>
            </div>
          ))
        )}
      </div>

      <AddReminderModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

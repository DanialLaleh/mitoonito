"use client";

import { useState } from "react";
import { createReminderAction } from "@/app/actions/reminders";

export default function AddReminderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createReminderAction(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-darkGray">یادآور جدید</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-xl leading-none text-gray-500 hover:bg-gray-100"
            aria-label="بستن"
          >
            ×
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-darkGray">
              متن یادآور
            </label>
            <input
              name="text"
              type="text"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-brandGreen"
              placeholder="مثلاً پرداخت قبض"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-darkGray">
              زمان
            </label>
            <input
              name="remindAt"
              type="datetime-local"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-brandGreen"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-darkGray"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-brandGreen px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {loading ? "در حال ثبت..." : "ثبت یادآور"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

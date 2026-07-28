"use client";

import { useState } from "react";
import { createReminderAction } from "@/app/actions/reminders";
import { X, Bell, Clock, Repeat } from "lucide-react";
import { ReminderFrequency, ReminderMethod } from "@prisma/client";

export default function AddReminderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const title = formData.get("title") as string;
      const time = formData.get("time") as string;
      const frequency = formData.get("frequency") as ReminderFrequency;
      
      await createReminderAction({
        title,
        time,
        frequency,
        method: "PUSH", // پیش‌فرض برای PWA
      });
      
      onClose();
    } catch (error) {
      alert("خطایی در ثبت یادآور رخ داد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white w-full md:max-w-md rounded-t-[2.5rem] md:rounded-[2rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-darkGray flex items-center gap-2">
            <Bell className="text-brandGreen" />
            یادآور جدید
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {/* عنوان یادآور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">چه چیزی را یادآوری کنم؟</label>
            <input
              name="title"
              type="text"
              required
              placeholder="مثلاً: خوردن مکمل‌های ورزشی"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brandGreen outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* زمان */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Clock size={14} /> زمان
              </label>
              <input
                name="time"
                type="time"
                required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brandGreen outline-none"
              />
            </div>

            {/* تکرار */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Repeat size={14} /> تکرار
              </label>
              <select
                name="frequency"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brandGreen outline-none"
              >
                <option value="DAILY">هر روز</option>
                <option value="ONCE">فقط یک‌بار</option>
                <option value="WEEKLY">هفتگی</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brandGreen text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brandGreen/30 hover:bg-darkGreen transition-all disabled:opacity-50"
          >
            {loading ? "در حال ثبت..." : "تایید و ثبت یادآور"}
          </button>
        </form>
      </div>
    </div>
  );
}

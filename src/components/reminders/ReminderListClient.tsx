"use client";

import { useState, useTransition } from "react";
import { Bell, Plus, Trash2, Clock, Calendar } from "lucide-react";
import { toggleReminderStatusAction, deleteReminderAction } from "@/app/actions/reminders";
import AddReminderModal from "./AddReminderModal";
import { ReminderFrequency } from "@prisma/client";

interface ReminderItem {
  id: string;
  title: string;
  time: string;
  frequency: ReminderFrequency;
  isActive: boolean;
  habit?: { title: string } | null;
  task?: { title: string } | null;
}

export default function ReminderListClient({ initialReminders }: { initialReminders: ReminderItem[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // تغییر وضعیت فعال بودن
  const handleToggle = (id: string, currentState: boolean) => {
    startTransition(async () => {
      try {
        await toggleReminderStatusAction(id, currentState);
      } catch (error) {
        alert("خطا در به‌روزرسانی وضعیت");
      }
    });
  };

  // حذف یادآور
  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این یادآور مطمئن هستید؟")) {
      startTransition(async () => {
        try {
          await deleteReminderAction(id);
        } catch (error) {
          alert("خطا در حذف یادآور");
        }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-darkGray">یادآورهای من</h1>
          <p className="text-sm text-gray-500 mt-1">مدیریت اعلان‌ها و زمان‌بندی‌ها</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brandGreen text-white p-3 rounded-2xl shadow-lg hover:bg-darkGreen transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {initialReminders.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium">هنوز هیچ یادآوری تنظیم نکرده‌ای</p>
            <p className="text-sm text-gray-400 mt-1">با زدن دکمه + اولین یادآور را بساز</p>
          </div>
        ) : (
          initialReminders.map((reminder) => (
            <div 
              key={reminder.id} 
              className={`bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all ${
                isPending ? "opacity-70 pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${reminder.isActive ? 'bg-lightGreen/20 text-brandGreen' : 'bg-gray-100 text-gray-400'}`}>
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className={`font-semibold ${reminder.isActive ? 'text-darkGray' : 'text-gray-400 line-through'}`}>
                    {reminder.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {reminder.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {reminder.frequency === 'DAILY' ? 'هر روز' : reminder.frequency === 'WEEKLY' ? 'هفتگی' : 'یک‌بار'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch Toggle Button */}
                <button 
                  onClick={() => handleToggle(reminder.id, reminder.isActive)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors relative flex items-center ${
                    reminder.isActive ? 'bg-brandGreen' : 'bg-gray-300'
                  }`}
                >
                  <span 
                    className={`bg-white w-4 h-4 rounded-full shadow transition-transform absolute ${
                      reminder.isActive ? 'left-1' : 'right-1'
                    }`}
                  />
                </button>
                
                {/* Delete Button */}
                <button 
                  onClick={() => handleDelete(reminder.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tip for Marketing Mindset */}
      <div className="mt-8 bg-darkGray text-white p-4 rounded-2xl text-sm leading-relaxed opacity-90">
        <p>
          <strong>نکته دانیال:</strong> یادآورها فقط برای "فراموش نکردن" نیستند؛ آن‌ها ابزار ایجاد "قلاب" (Hook) در ذهن کاربر برای بازگشت به اپلیکیشن هستند. نرخ بازگشت (Retention) رابطه مستقیمی با تنظیم یادآورهای هوشمند دارد.
        </p>
      </div>

      {/* Modal */}
      <AddReminderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

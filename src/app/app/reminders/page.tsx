import { getRemindersAction } from "@/app/actions/reminders";
import { Bell, Plus, Trash2, Clock, Calendar } from "lucide-react";

export default async function RemindersPage() {
  const reminders = await getRemindersAction();

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-darkGray">یادآورهای من</h1>
          <p className="text-sm text-gray-500 mt-1">مدیریت اعلان‌ها و زمان‌بندی‌ها</p>
        </div>
        <button className="bg-brandGreen text-white p-3 rounded-2xl shadow-lg hover:bg-darkGreen transition-colors">
          <Plus size={24} />
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium">هنوز هیچ یادآوری تنظیم نکرده‌ای</p>
            <p className="text-sm text-gray-400 mt-1">با زدن دکمه + اولین یادآور را بساز</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div 
              key={reminder.id} 
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
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
                      {reminder.frequency === 'DAILY' ? 'هر روز' : 'یک‌بار'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle Switch (Simplified for UI) */}
                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${reminder.isActive ? 'bg-brandGreen' : 'bg-gray-300'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full transition-transform ${reminder.isActive ? 'translate-x-0' : 'translate-x-6'}`} />
                </div>
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
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
    </div>
  );
}

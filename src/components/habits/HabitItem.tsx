"use client"

import { useState } from "react";
import { toggleHabitLog } from "@/app/actions/habits";
import { useRouter } from "next/navigation";

export default function HabitItem({ habit, userId }: { habit: any, userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    const res = await toggleHabitLog({
      habitId: habit.id,
      userId,
      date: new Date()
    });
    if (res.success) {
      router.refresh();
    }
    setLoading(false);
  };

  const isCompletedToday = habit.completedDaysCount > 0; // در لیست overview فقط لاگ‌های اخیر را گرفتیم

  return (
    <div className="bg-white p-4 rounded-2xl border border-[#E6E7E8] shadow-sm flex items-center justify-between group transition-all hover:border-[#50B848]/30">
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
            isCompletedToday 
              ? "bg-[#50B848] border-[#50B848] text-white shadow-md shadow-[#50B848]/20" 
              : "bg-white border-[#E6E7E8] text-transparent hover:border-[#50B848]"
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        
        <div>
          <h3 className={`font-bold transition-all ${isCompletedToday ? "text-gray-400 line-through" : "text-[#434345]"}`}>
            {habit.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] bg-[#9FD18B]/20 text-[#367639] px-2 py-0.5 rounded-full font-medium">
              🔥 {habit.currentStreak} روز پشت‌هم
            </span>
            {habit.successRate > 0 && (
              <span className="text-[10px] text-gray-400">
                رشد: {habit.successRate}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
         {/* اینجا می‌توان بعداً دکمه ویرایش یا حذف اضافه کرد */}
         <button className="text-gray-300 hover:text-red-500 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
         </button>
      </div>
    </div>
  );
}

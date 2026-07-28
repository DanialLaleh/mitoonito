import { getHabitsOverview } from "@/app/actions/habits";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import HabitItem from "@/components/habits/HabitItem";
import Link from "next/link";

export default async function HabitsPage() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const result = await getHabitsOverview({ userId: session.userId as string });
  const habits = result.success ? result.habits : [];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 pb-24" dir="rtl">
      {/* هدر */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#434345]">عادت‌های من</h1>
          <p className="text-gray-400 text-sm mt-1">نظم، کلید موفقیت دانیال است.</p>
        </div>
        <Link 
          href="/app/habits/new" 
          className="bg-[#434345] text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>

      {/* بخش وضعیت کلی */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#50B848] p-5 rounded-3xl text-white shadow-sm shadow-[#50B848]/20">
          <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">کل عادت‌ها</span>
          <div className="text-3xl font-black mt-1">{habits.length}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#E6E7E8] text-[#434345] shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">میانگین پایبندی</span>
          <div className="text-3xl font-black mt-1 text-[#50B848]">
            {habits.length > 0 
              ? Math.round(habits.reduce((acc: any, h: any) => acc + h.successRate, 0) / habits.length)
              : 0}%
          </div>
        </div>
      </div>

      {/* لیست عادت‌ها */}
      <div className="space-y-3">
        {habits.length > 0 ? (
          habits.map((habit: any) => (
            <HabitItem key={habit.id} habit={habit} userId={session.userId as string} />
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-4 text-gray-300">🌿</div>
            <p className="text-gray-400 text-sm">هنوز عادتی نساخته‌ای دانیال. <br/> برای شروع، اولین عادتت را اضافه کن.</p>
          </div>
        )}
      </div>
      
      {/* پیام انگیزشی (Cynic Style) */}
      <div className="bg-gray-100 p-4 rounded-2xl text-[11px] text-gray-500 text-center leading-relaxed italic">
        "انگیزه چیزی است که تو را به حرکت وا می‌دارد، اما عادت چیزی است که تو را در مسیر نگه می‌دارد. البته اگر وسط راه خسته نشوی."
      </div>
    </div>
  );
}

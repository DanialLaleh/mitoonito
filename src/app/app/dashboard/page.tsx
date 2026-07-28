import { getDashboardAnalytics } from "@/app/actions/dashboard";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect("/login");
  }

  const result = await getDashboardAnalytics(session.userId as string);
  
  if (!result.success || !result.analytics) {
    return (
      <div className="p-6 text-center text-red-500 font-bold" dir="rtl">
        خطا در بارگذاری اطلاعات داشبورد
      </div>
    );
  }

  const data = result.analytics;
  const totalActivity = data.completedTasks + data.completedHabitLogsCount;

  // سناریوی بدون فعالیت در ۷ روز گذشته (Empty State)
  if (totalActivity === 0 && data.totalTasks === 0 && data.activeHabitsCount === 0) {
    return (
      <div className="p-6 max-w-md mx-auto my-12 text-center space-y-6 animate-fade-in" dir="rtl">
        <div className="text-6xl">🚀</div>
        <h2 className="text-xl font-bold text-[#434345]">داشبورد شما آماده تحلیل است!</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          دانیال، برای اینکه بتوانیم بازه بهره‌وری و تحلیل هفتگی تو را محاسبه کنیم، باید کارهای روزانه یا عادت‌هایت را ثبت و تیک بزنی.
        </p>
        <Link 
          href="/app/today" 
          className="inline-block w-full py-4 bg-[#50B848] text-white rounded-2xl font-bold hover:bg-[#367639] active:scale-[0.98] transition-all text-center text-sm shadow-md"
        >
          ورود به برنامه امروز
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28 md:pb-12" dir="rtl">
      {/* هدر بالایی کارت امتیاز */}
      <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] border border-[#E6E7E8] shadow-sm">
        <div>
          <h1 className="text-xl font-black text-[#434345]">وضعیت عملکرد</h1>
          <p className="text-gray-400 text-xs mt-1">تحلیل روند رشد تو در ۷ روز گذشته</p>
        </div>
        <div className="text-center bg-[#50B848]/10 px-5 py-3 rounded-2xl border border-[#50B848]/20">
          <span className="block text-[10px] text-[#367639] font-bold tracking-wider mb-0.5">امتیاز رشد</span>
          <span className="text-2xl font-black text-[#367639]">{data.productivityScore}</span>
        </div>
      </div>

      {/* شبکه کارت‌های خلاصه وضعیت */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* کارت ساعت طلایی */}
        <div className="bg-white p-5 rounded-[2rem] border border-[#E6E7E8] shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-gray-400 text-[10px] font-bold">بازه طلایی بهره‌وری</span>
          <div>
            <span className="text-lg font-black text-[#434345] block mt-1">{data.goldenTimeSlot}</span>
            <span className="text-[9px] text-gray-400 block mt-1">ساعتی که بیشترین تمرکز و تیک فعالیت را داشتی.</span>
          </div>
        </div>

        {/* کارت پیشرفت تسک‌ها */}
        <div className="bg-white p-5 rounded-[2rem] border border-[#E6E7E8] shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-gray-400 text-[10px] font-bold">میزان تکمیل تسک‌ها</span>
          <div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-[#50B848]">{data.completionRate}%</span>
              <span className="text-[10px] text-gray-400">({data.completedTasks} از {data.totalTasks})</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#50B848] h-full transition-all duration-500" style={{ width: `${data.completionRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* کارت تراز مالی */}
        <div className="bg-[#434345] p-5 rounded-[2rem] shadow-md text-white flex flex-col justify-between min-h-[120px]">
          <span className="text-gray-400 text-[10px] font-bold">تراز مالی کل</span>
          <div>
            <span className="text-xl font-bold block mt-1">{data.balance.toLocaleString()} <span className="text-xs font-normal opacity-85">تومان</span></span>
            <div className="flex justify-between mt-3 text-[9px] opacity-75 border-t border-white/10 pt-2">
              <span>درآمد: {data.totalIncome.toLocaleString()}</span>
              <span>هزینه: {data.totalExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* وضعیت پیشرفت اهداف فعال */}
      {data.goalsProgress && data.goalsProgress.length > 0 && (
        <div className="bg-white p-6 rounded-[2rem] border border-[#E6E7E8] shadow-sm space-y-4">
          <h3 className="font-black text-[#434345] text-sm">پیشرفت اهداف فعال</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.goalsProgress.map((goal: any) => (
              <div key={goal.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#434345]">{goal.title}</span>
                  <span className="text-[#50B848] font-black">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-250 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#50B848] h-full transition-all duration-500" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{goal.completedTasks} تسک ثبت‌شده از {goal.totalTasks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* کارت وضعیت پایبندی به عادت‌ها */}
      {data.habitsSummary && data.habitsSummary.length > 0 && (
        <div className="bg-white p-6 rounded-[2rem] border border-[#E6E7E8] shadow-sm space-y-4">
          <h3 className="font-black text-[#434345] text-sm">پایداری به عادت‌ها (۷ روز گذشته)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.habitsSummary.map((habit) => (
              <div key={habit.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-[#434345] text-xs">{habit.title}</span>
                  <span className="text-[10px] bg-[#9FD18B]/25 text-[#367639] px-2 py-0.5 rounded-full font-bold">
                    {habit.successRate}%
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 mt-3">
                  تعداد تیک‌ها: {habit.completedDaysCount} از ۷ روز
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* پراکندگی زمانی فعالیت‌ها */}
      <div className="bg-white p-6 rounded-[2rem] border border-[#E6E7E8] shadow-sm space-y-4">
        <h3 className="font-black text-[#434345] text-sm">تمرکز زمانی کارهای شما</h3>
        <div className="space-y-4">
          {Object.entries(data.activityDistribution).map(([key, value]) => {
            const labels: Record<string, string> = { 
              morning: "صبح (۶:۰۰ تا ۱۲:۰۰)", 
              afternoon: "ظهر/عصر (۱۲:۰۰ تا ۱۸:۰۰)", 
              evening: "شب (۱۸:۰۰ تا ۲۴:۰۰)", 
              night: "نیمه‌شب (۲۴:۰۰ تا ۶:۰۰)" 
            };
            const colors: Record<string, string> = { 
              morning: "bg-[#9FD18B]", 
              afternoon: "bg-[#50B848]", 
              evening: "bg-[#367639]", 
              night: "bg-[#434345]" 
            };
            const totalActions = totalActivity > 0 ? totalActivity : 1;
            const percentage = Math.round((value / totalActions) * 100);
            
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#434345]">{labels[key]}</span>
                  <span className="text-gray-400 font-bold">{value} فعالیت</span>
                </div>
                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                  <div className={`${colors[key]} h-full transition-all duration-350`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

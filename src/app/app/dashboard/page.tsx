// src/app/app/dashboard/page.tsx
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
  const totalActivity = data.completedTasks + data.activityDistribution.morning + data.activityDistribution.afternoon + data.activityDistribution.evening + data.activityDistribution.night;

  // سناریوی بدون فعالیت در ۷ روز گذشته (Empty State)
  if (totalActivity === 0 && data.totalTasks === 0) {
    return (
      <div className="p-6 max-w-md mx-auto my-12 text-center space-y-6 animate-fade-in" dir="rtl">
        <div className="text-6xl">🚀</div>
        <h2 className="text-xl font-bold text-[#434345]">داشبورد شما آماده تحلیل است!</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          برای اینکه بتوانیم ساعت طلایی بهره‌وری و تحلیل هفتگی شما را محاسبه کنیم، کافی است اولین کارهای خود را در بخش برنامه روزانه ثبت کرده و آن‌ها را تیک بزنید.
        </p>
        <Link 
          href="/app/today" 
          className="inline-block w-full py-3.5 bg-[#50B848] text-white rounded-xl font-bold hover:bg-[#367639] active:scale-[0.98] transition-all text-center text-sm shadow-sm"
        >
          ورود به برنامه امروز
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24 md:pb-8" dir="rtl">
      {/* هدر کامپکت و مدرن */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#E6E7E8] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#434345]">وضعیت عملکرد</h1>
          <p className="text-gray-400 text-xs mt-0.5">تحلیل ۷ روز گذشته</p>
        </div>
        <div className="text-center bg-[#50B848]/10 px-4 py-2 rounded-xl border border-[#50B848]/20">
          <span className="block text-[10px] text-[#367639] font-medium">امتیاز کل</span>
          <span className="text-lg font-black text-[#367639]">{data.productivityScore}</span>
        </div>
      </div>

      {/* کارت‌های وضعیت ۳ ستونه */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* ساعت طلایی */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6E7E8] shadow-sm flex flex-col justify-between min-h-[110px]">
          <span className="text-gray-400 text-[10px] font-bold">بازه طلایی بهره‌وری</span>
          <span className="text-lg font-bold text-[#434345] block mt-1">{data.goldenTimeSlot}</span>
          <span className="text-[9px] text-gray-400 block mt-2">بر اساس بیشترین تیک‌های ثبت شده شما.</span>
        </div>

        {/* نرخ تکمیل */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6E7E8] shadow-sm flex flex-col justify-between min-h-[110px]">
          <span className="text-gray-400 text-[10px] font-bold">تکمیل تسک‌ها</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-[#50B848]">{data.completionRate}%</span>
            <span className="text-[10px] text-gray-400">({data.completedTasks} از {data.totalTasks})</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#50B848] h-full transition-all" style={{ width: `${data.completionRate}%` }}></div>
          </div>
        </div>

        {/* وضعیت مالی */}
        <div className="bg-[#434345] p-5 rounded-2xl shadow-sm text-white flex flex-col justify-between min-h-[110px]">
          <span className="text-gray-400 text-[10px] font-bold">تراز مالی کل</span>
          <span className="text-xl font-bold block mt-1">{data.balance.toLocaleString()} <span className="text-xs font-normal opacity-80">تومان</span></span>
          <div className="flex justify-between mt-2 text-[9px] opacity-70">
            <span>درآمد: {data.totalIncome.toLocaleString()}</span>
            <span>هزینه: {data.totalExpense.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* وضعیت اهداف فعال */}
      {data.goalsProgress && data.goalsProgress.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-[#E6E7E8] shadow-sm">
          <h3 className="font-bold text-[#434345] text-sm mb-4">پیشرفت اهداف فعال</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.goalsProgress.map((goal: any) => (
              <div key={goal.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#434345]">{goal.title}</span>
                  <span className="text-[#50B848] font-bold">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#50B848] h-full transition-all duration-500" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{goal.completedTasks} تسک تکمیل شده از {goal.totalTasks} تسک کل</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* پراکندگی زمانی فعالیت‌ها */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6E7E8] shadow-sm">
        <h3 className="font-bold text-[#434345] text-sm mb-4">تمرکز زمانی کارهای شما</h3>
        <div className="space-y-4">
          {Object.entries(data.activityDistribution).map(([key, value]) => {
            const labels: any = { 
              morning: "صبح (۶:۰۰ تا ۱۲:۰۰)", 
              afternoon: "ظهر/عصر (۱۲:۰۰ تا ۱۸:۰۰)", 
              evening: "شب (۱۸:۰۰ تا ۲۴:۰۰)", 
              night: "نیمه‌شب (۲۴:۰۰ تا ۶:۰۰)" 
            };
            const colors: any = { 
              morning: "bg-[#9FD18B]", 
              afternoon: "bg-[#50B848]", 
              evening: "bg-[#367639]", 
              night: "bg-[#434345]" 
            };
            const percentage = totalActivity > 0 ? (value / totalActivity) * 100 : 0;
            
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#434345]">{labels[key]}</span>
                  <span className="text-gray-400 font-bold">{value} کار</span>
                </div>
                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                  <div className={`${colors[key]} h-full transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

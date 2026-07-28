// src/app/app/dashboard/page.tsx
import { getDashboardAnalytics } from "@/app/actions/dashboard";
import { getSession } from "@/lib/auth"; // این فایل را قبلاً برای JWT ساخته‌ایم
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect("/login");
  }

  const result = await getDashboardAnalytics(session.userId as string);
  
  if (!result.success || !result.analytics) {
    return <div className="p-6 text-center text-red-500 font-bold">خطا در بارگذاری داشبورد</div>;
  }

  const data = result.analytics;
  const totalActivity = data.completedTasks + data.activityDistribution.morning + data.activityDistribution.afternoon + data.activityDistribution.evening + data.activityDistribution.night;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8" dir="rtl">
      {/* هدر */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#E6E7E8] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#434345]">خلاصه وضعیت میتونی‌تو</h1>
          <p className="text-gray-400 text-sm">تحلیل عملکرد ۷ روز اخیر</p>
        </div>
        <div className="text-left">
          <div className="text-xs text-gray-400 mb-1 font-medium">امتیاز کل</div>
          <div className="bg-[#50B848] text-white px-4 py-1 rounded-full font-bold text-lg">
            {data.productivityScore}
          </div>
        </div>
      </div>

      {/* کارت‌های اصلی */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E6E7E8] shadow-sm">
          <p className="text-gray-400 text-xs font-bold mb-2">ساعت طلایی شما</p>
          <p className="text-xl font-bold text-[#434345]">{data.goldenTimeSlot}</p>
          <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">زمانی که بیشترین بهره‌وری را در آن ثبت کرده‌اید.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E6E7E8] shadow-sm">
          <p className="text-gray-400 text-xs font-bold mb-2">تکمیل تسک‌ها</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-[#50B848]">{data.completionRate}%</span>
            <span className="text-xs text-gray-400 pb-1">({data.completedTasks} از {data.totalTasks})</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-4">
            <div className="bg-[#50B848] h-2 rounded-full transition-all" style={{ width: `${data.completionRate}%` }}></div>
          </div>
        </div>

        <div className="bg-[#434345] p-6 rounded-2xl shadow-sm text-white">
          <p className="text-gray-400 text-xs font-bold mb-2">تراز مالی</p>
          <p className="text-2xl font-bold">{data.balance.toLocaleString()} <span className="text-xs font-normal">تومان</span></p>
          <div className="flex justify-between mt-4 text-[10px] opacity-70">
            <span>درآمد: {data.totalIncome.toLocaleString()}</span>
            <span>هزینه: {data.totalExpense.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* تحلیل ساعتی */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E7E8] shadow-sm">
        <h3 className="font-bold text-[#434345] mb-6">پراکندگی زمانی فعالیت‌ها</h3>
        <div className="space-y-5">
          {Object.entries(data.activityDistribution).map(([key, value]) => {
            const labels: any = { morning: "صبح", afternoon: "ظهر/عصر", evening: "شب", night: "نیمه‌شب" };
            const colors: any = { morning: "bg-[#9FD18B]", afternoon: "bg-[#50B848]", evening: "bg-[#367639]", night: "bg-[#434345]" };
            const percentage = totalActivity > 0 ? (value / totalActivity) * 100 : 0;
            
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium">{labels[key]}</span>
                  <span className="text-gray-400">{value} فعالیت</span>
                </div>
                <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                  <div className={`${colors[key]} h-full transition-all`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

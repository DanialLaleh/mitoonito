import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createHabitAction, deleteHabitAction, logHabitAction } from "@/app/actions/habits";

export default async function HabitsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const habits = await prisma.habit.include({
    where: { userId: user.id },
    include: {
      logs: {
        orderBy: { loggedAt: "desc" },
      },
    },
  });

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 text-right" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#434345]">عادت‌های من</h1>
        <p className="text-xs text-gray-500 mt-1">تکرار، کلید موفقیت در ایده‌های بزرگ است دانیال</p>
      </div>

      {/* فرم ایجاد عادت */}
      <div className="bg-white border border-[#E6E7E8] rounded-2xl p-4 mb-8 shadow-sm">
        <form action={createHabitAction} className="flex gap-2">
          <input
            type="text"
            name="title"
            placeholder="عادت جدید (مثلاً: ۳۰ دقیقه مطالعه)"
            required
            className="flex-1 px-3 py-2 text-sm border border-[#E6E7E8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#50B848]"
          />
          <button
            type="submit"
            className="bg-[#50B848] text-white px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform"
          >
            افزودن
          </button>
        </form>
      </div>

      {/* لیست عادت‌ها */}
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">هنوز عادتی ثبت نکرده‌ای.</p>
          </div>
        ) : (
          habits.map((habit) => (
            <div key={habit.id} className="bg-white border border-[#E6E7E8] rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#434345]">{habit.title}</h3>
                <form action={deleteHabitAction}>
                  <input type="hidden" name="habitId" value={habit.id} />
                  <button type="submit" className="text-red-400 hover:text-red-600 text-[10px]">حذف عادت</button>
                </form>
              </div>

              {/* نمایش ساده وضعیت ۷ روز اخیر */}
              <div className="flex justify-between items-center gap-1 mb-4" dir="ltr">
                {[...Array(7)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const isLogged = habit.logs.some(log => 
                    log.loggedAt.toISOString().split('T')[0] === dateStr
                  );

                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[8px] text-gray-400 uppercase">
                        {date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)}
                      </span>
                      <form action={logHabitAction}>
                        <input type="hidden" name="habitId" value={habit.id} />
                        <input type="hidden" name="date" value={dateStr} />
                        <button
                          type="submit"
                          className={`w-8 h-8 rounded-lg border transition-all ${
                            isLogged 
                            ? "bg-[#50B848] border-[#50B848] shadow-md shadow-[#50B848]/20" 
                            : "bg-white border-[#E6E7E8]"
                          }`}
                        />
                      </form>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-50 pt-2">
                <span>مجموع تکرارها: {habit.logs.length} بار</span>
                <span>امتیاز کسب شده: {habit.logs.length * 15}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

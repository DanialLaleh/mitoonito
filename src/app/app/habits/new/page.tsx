// src/app/app/habits/new/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createHabit } from "@/app/actions/habits";
import Link from "next/link";

export default async function NewHabitPage() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  // دریافت حوزه‌ها برای متصل کردن عادت به یک حوزه خاص (مثل فیتنس یا کار)
  const areas = await prisma.area.findMany({
    where: { userId: session.userId as string },
  });

  async function handleSubmit(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const areaId = formData.get("areaId") as string;
    const session = await getSession();

    if (title && session?.userId) {
      await createHabit({
        userId: session.userId as string,
        title,
        description,
        areaId: areaId === "none" ? null : areaId,
        frequency: "daily",
      });
      redirect("/app/habits");
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/habits" className="p-2 bg-gray-100 rounded-xl text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-black text-[#434345]">تعریف عادت جدید</h1>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 mr-1">عنوان عادت</label>
          <input
            name="title"
            required
            placeholder="مثلاً: ۴۵ دقیقه تمرین فیتنس"
            className="w-full p-4 bg-white border border-[#E6E7E8] rounded-2xl focus:ring-2 focus:ring-[#50B848] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 mr-1">توضیحات (اختیاری)</label>
          <textarea
            name="description"
            placeholder="چرا این عادت برایت مهم است؟"
            rows={3}
            className="w-full p-4 bg-white border border-[#E6E7E8] rounded-2xl focus:ring-2 focus:ring-[#50B848] focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 mr-1">حوزه فعالیت</label>
          <select
            name="areaId"
            className="w-full p-4 bg-white border border-[#E6E7E8] rounded-2xl focus:ring-2 focus:ring-[#50B848] outline-none appearance-none"
          >
            <option value="none">انتخاب نشده</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-4 bg-[#434345] text-white rounded-2xl font-bold shadow-lg shadow-gray-200 active:scale-[0.98] transition-all"
          >
            ثبت و شروع زنجیره
          </button>
        </div>
      </form>
    </div>
  );
}

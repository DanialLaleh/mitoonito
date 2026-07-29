import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createHabit } from "@/app/actions/habits";
import Link from "next/link";

export default async function NewHabitPage() {
  const session = await getSession();
  if (!session?.sub) redirect("/login");

  const areas = await prisma.area.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  async function handleSubmit(formData: FormData) {
    "use server";

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const areaId = String(formData.get("areaId") || "");

    const session = await getSession();

    if (title && session?.sub) {
      await createHabit({
        userId: session.sub,
        title,
        description,
        areaId: areaId === "none" ? null : areaId,
        frequency: "daily",
      });

      redirect("/app/habits");
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ثبت عادت جدید</h1>
        <Link href="/app/habits" className="text-sm text-green-600">
          بازگشت
        </Link>
      </div>

      <form action={handleSubmit} className="space-y-4 rounded-xl border p-4">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            عنوان
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="مثلاً تمرین بدنسازی"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            توضیحات
          </label>
          <textarea
            id="description"
            name="description"
            className="min-h-24 w-full rounded-lg border px-3 py-2"
            placeholder="توضیحات اختیاری"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="areaId" className="block text-sm font-medium">
            بخش
          </label>
          <select id="areaId" name="areaId" className="w-full rounded-lg border px-3 py-2">
            <option value="none">بدون بخش</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-green-600 px-4 py-2 text-white"
        >
          ذخیره
        </button>
      </form>
    </div>
  );
}

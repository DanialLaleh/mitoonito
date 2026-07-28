import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createAreaAction, deleteAreaAction } from "./actions";
import { planLimits, defaultAreas } from "@/lib/design-tokens";
import { AppShell } from "@/components/app/AppShell";

export default async function AreasPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [areas, areaCount] = await Promise.all([
    prisma.area.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.area.count({
      where: {
        userId: user.id,
      },
    }),
  ]);

  const limit =
    planLimits[user.plan as keyof typeof planLimits]?.maxAreas ?? 0;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-dark-gray">حوزه‌ها</h1>
          <p className="text-sm text-dark-gray/70">
            {areaCount} از {limit} حوزه استفاده شده است
          </p>
        </div>

        <form
          action={createAreaAction}
          className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-3"
        >
          <input
            name="title"
            placeholder="عنوان حوزه"
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green"
          />
          <input
            name="icon"
            placeholder="آیکون"
            defaultValue="circle"
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green"
          />
          <input
            name="color"
            placeholder="رنگ"
            defaultValue="#50B848"
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green"
          />
          <button
            type="submit"
            className="rounded-xl bg-brand-green px-4 py-3 font-medium text-white transition hover:bg-brand-darkGreen sm:col-span-3"
          >
            افزودن حوزه
          </button>
        </form>

        {areas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-dark-gray/70">
            هنوز هیچ حوزه‌ای ساخته نشده است.
          </div>
        ) : (
          <div className="grid gap-3">
            {areas.map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full"
                    style={{ backgroundColor: area.color }}
                  />
                  <div>
                    <h2 className="font-medium text-dark-gray">{area.title}</h2>
                    <p className="text-xs text-dark-gray/60">
                      {area.icon} · {area.color}
                    </p>
                  </div>
                </div>

                <form action={deleteAreaAction}>
                  <input type="hidden" name="areaId" value={area.id} />
                  <button
                    type="submit"
                    className="rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    حذف
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-dark-gray">
            حوزه‌های پیش‌فرض
          </h3>
          <div className="flex flex-wrap gap-2">
            {defaultAreas.map((item) => (
              <span
                key={item.title}
                className="rounded-full bg-white px-3 py-1 text-xs text-dark-gray shadow-sm"
              >
                {item.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

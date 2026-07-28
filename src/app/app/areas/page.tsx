import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import { createAreaAction, deleteAreaAction } from "./actions";

export default async function AreasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const areas = await prisma.area.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">حوزه‌های من</h1>
      
      {/* فرم افزودن حوزه */}
      <form action={createAreaAction} className="flex gap-2">
        <input name="title" placeholder="نام حوزه جدید" className="border p-2 rounded" required />
        <button type="submit" className="bg-brand-green text-white px-4 py-2 rounded">افزودن</button>
      </form>

      {/* لیست حوزه‌ها */}
      <div className="grid gap-4">
        {areas.map((area) => (
          <div key={area.id} className="flex justify-between items-center p-4 border rounded">
            <span>{area.title}</span>
            <form action={deleteAreaAction.bind(null, area.id)}>
              <button className="text-red-500 text-sm">حذف</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

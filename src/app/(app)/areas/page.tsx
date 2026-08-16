import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AreaManager from "@/components/AreaManager";

export default async function AreasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const areas = await prisma.area.findMany({
    where: { userId: session.userId },
    orderBy: { order: "asc" },
  });

  return <AreaManager areas={areas} />;
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex ">
      <Sidebar userName={session.name} />
      <main className="flex-1 min-h-screen pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}

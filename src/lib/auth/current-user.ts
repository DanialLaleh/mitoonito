import { prisma } from "@/lib/prisma";
import { getSession } from "./session";

export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.sub) return null;

  return prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      plan: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

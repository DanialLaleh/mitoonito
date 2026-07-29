import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth/session";

export async function getCurrentUser() {
  const session = await getSessionFromCookie();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      createdAt: true,
    },
  });

  return user;
}

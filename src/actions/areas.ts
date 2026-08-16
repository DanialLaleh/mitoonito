"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { areaSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string } | null;

const FREE_AREA_LIMIT = 5;

export async function createAreaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const parsed = areaSchema.safeParse({
    title: formData.get("title"),
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "کاربر یافت نشد" };

  if (user.plan === "FREE") {
    const count = await prisma.area.count({
      where: { userId: session.userId },
    });
    if (count >= FREE_AREA_LIMIT) {
      return {
        error: `در پلن رایگان حداکثر ${FREE_AREA_LIMIT} حوزه می‌توانید بسازید. برای ساخت حوزه‌ی بیشتر، به پلن ویژه ارتقا دهید.`,
      };
    }
  }

  const lastArea = await prisma.area.findFirst({
    where: { userId: session.userId },
    orderBy: { order: "desc" },
  });

  await prisma.area.create({
    data: {
      userId: session.userId,
      title: parsed.data.title,
      color: parsed.data.color,
      order: (lastArea?.order ?? -1) + 1,
    },
  });

  revalidatePath("/areas");
  return null;
}

export async function updateAreaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "ابتدا وارد شوید" };

  const id = formData.get("id") as string;
  const parsed = areaSchema.safeParse({
    title: formData.get("title"),
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const area = await prisma.area.findUnique({ where: { id } });
  if (!area || area.userId !== session.userId)
    return { error: "دسترسی مجاز نیست" };

  await prisma.area.update({
    where: { id },
    data: { title: parsed.data.title, color: parsed.data.color },
  });

  revalidatePath("/areas");
  return null;
}

export async function deleteAreaAction(id: string) {
  const session = await getSession();
  if (!session) return;

  const area = await prisma.area.findUnique({ where: { id } });
  if (!area || area.userId !== session.userId) return;

  await prisma.area.delete({ where: { id } });
  revalidatePath("/areas");
}

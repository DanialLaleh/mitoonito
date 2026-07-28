"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { planLimits } from "@/lib/design-tokens";

function normalizeTitle(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeColor(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeIcon(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function createAreaAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const title = normalizeTitle(formData.get("title"));
  const icon = normalizeIcon(formData.get("icon")) || "circle";
  const color = normalizeColor(formData.get("color")) || "#50B848";

  if (!title) {
    throw new Error("Title is required");
  }

  const currentCount = await prisma.area.count({
    where: {
      userId: user.id,
    },
  });

  const userLimit =
    planLimits[user.plan as keyof typeof planLimits]?.maxAreas ?? 0;

  if (currentCount >= userLimit) {
    throw new Error("Area limit reached");
  }

  await prisma.area.create({
    data: {
      userId: user.id,
      title,
      icon,
      color,
      sortOrder: currentCount,
    },
  });

  revalidatePath("/app/areas");
}

export async function deleteAreaAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const areaId = normalizeTitle(formData.get("areaId"));
  if (!areaId) {
    throw new Error("Area ID is required");
  }

  const area = await prisma.area.findFirst({
    where: {
      id: areaId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!area) {
    throw new Error("Area not found");
  }

  await prisma.area.delete({
    where: {
      id: areaId,
    },
  });

  revalidatePath("/app/areas");
}

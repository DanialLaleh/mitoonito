"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

function normalizeTitle(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function normalizeColor(value: FormDataEntryValue | null) {
  return String(value || "").trim() || null;
}

function normalizeIcon(value: FormDataEntryValue | null) {
  return String(value || "").trim() || null;
}

export async function createArea(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const title = normalizeTitle(formData.get("title"));
  const color = normalizeColor(formData.get("color"));
  const icon = normalizeIcon(formData.get("icon"));

  if (!title) {
    throw new Error("Area title is required");
  }

  const area = await prisma.area.create({
    data: {
      userId: user.id,
      name: title,
      color,
      icon,
    },
  });

  revalidatePath("/app/areas");
  revalidatePath("/app/dashboard");

  return area;
}

export async function updateArea(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const id = String(formData.get("id") || "").trim();
  const title = normalizeTitle(formData.get("title"));
  const color = normalizeColor(formData.get("color"));
  const icon = normalizeIcon(formData.get("icon"));

  if (!id) {
    throw new Error("Area ID is required");
  }

  const area = await prisma.area.update({
    where: {
      id,
      userId: user.id,
    },
    data: {
      name: title,
      color,
      icon,
    },
  });

  revalidatePath("/app/areas");
  revalidatePath("/app/dashboard");

  return area;
}

export async function deleteArea(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("Area ID is required");
  }

  const area = await prisma.area.delete({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/app/areas");
  revalidatePath("/app/dashboard");

  return area;
}

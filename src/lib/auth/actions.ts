"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { redirect } from "next/navigation";

const defaultAreas = [
  { name: "کار", icon: "briefcase" },
  { name: "سلامت", icon: "heart" },
  { name: "مالی", icon: "wallet" },
  { name: "یادگیری", icon: "book-open" },
];

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("این ایمیل قبلاً ثبت شده است.");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
      areas: {
        create: defaultAreas,
      },
    },
    select: {
      id: true,
      email: true,
      plan: true,
    },
  });

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    plan: user.plan,
  });

  await setSessionCookie(token);

  redirect("/app/today");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    throw new Error("ایمیل یا رمز عبور اشتباه است.");
  }

  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    throw new Error("ایمیل یا رمز عبور اشتباه است.");
  }

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    plan: user.plan,
  });

  await setSessionCookie(token);

  redirect("/app/today");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth/session";
import { registerSchema, loginSchema } from "@/lib/validations/auth";

export type AuthActionState = {
  error?: string;
};

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: String(formData.get("password") || ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid form data" };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "این ایمیل قبلاً ثبت شده است." };
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
  });

  await setSessionCookie(token);

  redirect("/app/today");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: String(formData.get("password") || ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid form data" };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return { error: "ایمیل یا رمز عبور اشتباه است." };
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { error: "ایمیل یا رمز عبور اشتباه است." };
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
  });

  await setSessionCookie(token);

  redirect("/app/today");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

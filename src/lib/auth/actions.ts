"use server";

import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export type AuthActionState = {
  error?: string;
};

export async function registerAction(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingUser) {
      return { error: "این ایمیل قبلاً ثبت شده است." };
    }

    const hashedPassword = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email!,
    });

    await setSessionCookie(token);
    redirect("/app/today");
  } catch (error) {
    console.error("registerAction error:", error);
    return { error: "ثبت‌نام ناموفق بود." };
  }
}

export async function loginAction(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user || !user.password) {
      return { error: "ایمیل یا رمز عبور اشتباه است." };
    }

    const valid = await verifyPassword(parsed.data.password, user.password);
    if (!valid) {
      return { error: "ایمیل یا رمز عبور اشتباه است." };
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email!,
    });

    await setSessionCookie(token);
    redirect("/app/today");
  } catch (error) {
    console.error("loginAction error:", error);
    return { error: "ورود ناموفق بود." };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

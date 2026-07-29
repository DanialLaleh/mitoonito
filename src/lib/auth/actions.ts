"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie, deleteSessionCookie } from "@/lib/auth/session";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { z } from "zod";

export type AuthActionResult = {
  ok: boolean;
  message?: string;
};

export async function registerAction(_: AuthActionResult, formData: FormData): Promise<AuthActionResult> {
  try {
    const raw = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, message: "اطلاعات ثبت‌نام معتبر نیست." };
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, message: "این ایمیل قبلاً ثبت شده است." };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        plan: "FREE",
        areas: {
          create: [{ title: "شخصی" }, { title: "کار" }, { title: "مالی" }],
        },
      },
      select: {
        id: true,
        email: true,
        plan: true,
      },
    });

    const { token, maxAge } = await createSessionToken({
      sub: user.id,
      email: user.email ?? email,
      plan: user.plan,
    });

    await setSessionCookie(token, maxAge);

    return { ok: true, message: "ثبت‌نام با موفقیت انجام شد." };
  } catch (err) {
    console.error("registerAction error:", err);
    return {
      ok: false,
      message: "ثبت‌نام انجام نشد. اتصال دیتابیس و JWT_SECRET را بررسی کنید.",
    };
  }
}

export async function loginAction(_: AuthActionResult, formData: FormData): Promise<AuthActionResult> {
  try {
    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, message: "اطلاعات ورود معتبر نیست." };
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { ok: false, message: "ایمیل یا رمز عبور اشتباه است." };
    }

    if (!user.password) {
      return { ok: false, message: "ایمیل یا رمز عبور اشتباه است." };
    }

    const valid = await verifyPassword(password, user.password);

    if (!valid) {
      return { ok: false, message: "ایمیل یا رمز عبور اشتباه است." };
    }

    const { token, maxAge } = await createSessionToken({
      sub: user.id,
      email: user.email ?? email,
      plan: user.plan,
    });

    await setSessionCookie(token, maxAge);

    return { ok: true, message: "ورود با موفقیت انجام شد." };
  } catch (err) {
    console.error("loginAction error:", err);
    return {
      ok: false,
      message: "ورود انجام نشد. اتصال دیتابیس و JWT_SECRET را بررسی کنید.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  await deleteSessionCookie();
}

"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { defaultAreas } from "@/lib/design-tokens";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export type AuthActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "اطلاعات وارد شده معتبر نیست.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, message: "این ایمیل قبلاً ثبت شده است." };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        plan: "FREE",
        areas: {
          create: defaultAreas.map((area, index) => ({
            title: area.title,
            icon: area.icon,
            sortOrder: index,
            color: "#50B848",
          })),
        },
      },
      select: { id: true, email: true, plan: true },
    });

    const { token, maxAge } = await createSessionToken({
      sub: user.id,
      email: user.email,
      plan: user.plan,
    });
    await setSessionCookie(token, maxAge);
  } catch (err) {
    console.error("registerAction error:", err);
    return {
      ok: false,
      message:
        "ثبت‌نام انجام نشد. اتصال دیتابیس و JWT_SECRET را بررسی کنید.",
    };
  }

  redirect("/app/today");
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "ایمیل یا رمز عبور معتبر نیست.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { ok: false, message: "ایمیل یا رمز عبور اشتباه است." };
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return { ok: false, message: "ایمیل یا رمز عبور اشتباه است." };
    }

    const { token, maxAge } = await createSessionToken({
      sub: user.id,
      email: user.email,
      plan: user.plan,
    });
    await setSessionCookie(token, maxAge);
  } catch (err) {
    console.error("loginAction error:", err);
    return {
      ok: false,
      message: "ورود انجام نشد. اتصال دیتابیس و JWT_SECRET را بررسی کنید.",
    };
  }

  redirect("/app/today");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

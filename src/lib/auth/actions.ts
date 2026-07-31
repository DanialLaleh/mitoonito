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
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "لطفاً اطلاعات را به‌درستی وارد کنید.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
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
        create: defaultAreas.map((area, index) => ({
          name: area.name ?? area.title,
          icon: area.icon,
          sortOrder: index,
          color: "#50B848",
        })),
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

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "لطفاً اطلاعات را به‌درستی وارد کنید.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      plan: true,
    },
  });

  if (!user?.password) {
    return { ok: false, message: "ایمیل یا رمز عبور اشتباه است." };
  }

  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    return { ok: false, message: "ایمیل یا رمز عبور اشتباه است." };
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

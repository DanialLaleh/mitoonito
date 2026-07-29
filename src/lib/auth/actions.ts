import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "./password";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "./session";

export async function registerAction(formData: FormData) {
  try {
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        plan: "FREE",
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

    setSessionCookie(token);

    return { ok: true };
  } catch (error) {
    console.error("registerAction error:", error);
    return { ok: false, message: "خطا در ثبت‌نام" };
  }
}

export async function loginAction(formData: FormData) {
  try {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        plan: true,
        password: true,
      },
    });

    if (!user || !user.password) {
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

    setSessionCookie(token);

    return { ok: true };
  } catch (error) {
    console.error("loginAction error:", error);
    return { ok: false, message: "خطا در ورود" };
  }
}

export async function logoutAction() {
  clearSessionCookie();
}

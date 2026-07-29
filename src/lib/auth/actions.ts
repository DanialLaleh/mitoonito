"use server";

import { hashPassword, verifyPassword } from "./password";
import { prisma } from "@/lib/prisma";
import { createSession } from "./session";
import { redirect } from "next/navigation";

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "");

  if (!email || !password) throw new Error("ایمیل و رمز عبور الزامی است");

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      plan: "FREE",
      // ایجاد بخش‌های پیش‌فرض برای کاربر جدید
      areas: {
        create: [
          { name: "شخصی", icon: "user", sortOrder: 1 },
          { name: "کاری", icon: "briefcase", sortOrder: 2 },
          { name: "سلامتی", icon: "heart", sortOrder: 3 },
        ],
      },
    },
  });

  await createSession(user.id);
  redirect("/app/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw new Error("کاربری با این مشخصات یافت نشد");
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) throw new Error("رمز عبور اشتباه است");

  await createSession(user.id);
  redirect("/app/dashboard");
}

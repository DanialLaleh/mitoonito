import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام حداقل ۲ کاراکتر باشد")
    .max(50, "نام خیلی بلند است"),
  email: z
    .string()
    .trim()
    .email("ایمیل معتبر نیست")
    .max(100)
    .transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(8, "رمز حداقل ۸ کاراکتر باشد")
    .max(72, "رمز خیلی بلند است"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("ایمیل معتبر نیست")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

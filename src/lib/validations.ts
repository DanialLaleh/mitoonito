import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ حرف باشد"),
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

export const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export const areaSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان حوزه را وارد کنید")
    .max(50, "عنوان خیلی طولانی است"),
  color: z.string().optional(),
});

export type AreaInput = z.infer<typeof areaSchema>;
export const goalSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان هدف را وارد کنید")
    .max(100, "عنوان خیلی طولانی است"),
  areaId: z.string().optional(),
  targetValue: z.coerce.number().positive("مقدار هدف باید بزرگتر از صفر باشد"),
  unit: z.string().optional(),
  deadline: z.string().optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;

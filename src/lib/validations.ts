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
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان وظیفه را وارد کنید")
    .max(150, "عنوان خیلی طولانی است"),
  description: z.string().optional(),
  areaId: z.string().optional(),
  parentTaskId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  labels: z.string().optional(), // متن با کاما جدا می‌شه، توی کد سرور به آرایه تبدیل می‌شه
  recurrenceFrequency: z
    .enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"])
    .default("NONE"),
  scheduledDate: z.string().min(1, "تاریخ برنامه‌ریزی را انتخاب کنید"),
  dueDate: z.string().optional(),
  estimatedMinutes: z.coerce.number().int().positive().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;
export const habitSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان عادت را وارد کنید")
    .max(100, "عنوان خیلی طولانی است"),
  description: z.string().optional(),
  areaId: z.string().optional(),
  frequency: z.enum(["DAILY", "WEEKLY"]).default("DAILY"),
  daysOfWeek: z.array(z.coerce.number().int().min(0).max(6)).optional(),
  reminderTime: z.string().optional(),
});

export type HabitInput = z.infer<typeof habitSchema>;
export const reminderSchema = z.object({
  text: z
    .string()
    .min(1, "متن یادآور را وارد کنید")
    .max(150, "متن خیلی طولانی است"),
  remindAt: z.string().min(1, "زمان یادآوری را انتخاب کنید"),
});

export type ReminderInput = z.infer<typeof reminderSchema>;
export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive("مبلغ باید بزرگتر از صفر باشد"),
  category: z.string().min(1, "دسته‌بندی را وارد کنید").max(50),
  description: z.string().optional(),
  date: z.string().min(1, "تاریخ را انتخاب کنید"),
  accountId: z.string().optional(),
  isRecurring: z.coerce.boolean().optional(),
  recurrenceFrequency: z
    .enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"])
    .default("NONE"),
});

export const accountSchema = z.object({
  name: z.string().min(1, "نام حساب را وارد کنید").max(50),
});

export const budgetSchema = z.object({
  category: z.string().min(1, "دسته‌بندی را وارد کنید").max(50),
  monthlyLimit: z.coerce.number().positive("سقف بودجه باید بزرگتر از صفر باشد"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export const milestoneSchema = z.object({
  goalId: z.string().min(1),
  title: z
    .string()
    .min(1, "عنوان مرحله را وارد کنید")
    .max(100, "عنوان خیلی طولانی است"),
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;

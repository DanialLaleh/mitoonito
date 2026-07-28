// src/app/actions/tasks.ts
'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/current-user"
import { revalidatePath } from "next/cache"

/**
 * ایجاد تسک جدید
 * با Schema فعلی هماهنگ شده و از dueDate استفاده می‌کند
 */
export async function createTaskAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error("لطفا ابتدا وارد حساب خود شوید")

  const title = formData.get("title") as string
  const dueDateString = formData.get("dueDate") as string // فرمت: YYYY-MM-DD
  
  if (!title) throw new Error("عنوان تسک الزامی است")

  await prisma.task.create({
    data: {
      title,
      dueDate: dueDateString ? new Date(dueDateString) : new Date(),
      userId: user.id,
      isCompleted: false,
    },
  })

  revalidatePath("/app/today")
  revalidatePath("/app/dashboard")
}

/**
 * تغییر وضعیت انجام تسک
 * فیلد completedAt را برای تحلیل "ساعات طلایی" بروزرسانی می‌کند
 */
export async function toggleTaskCompletedAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error("عدم دسترسی")

  const id = formData.get("id") as string
  const isCompleted = formData.get("isCompleted") === "true"

  await prisma.task.update({
    where: { id, userId: user.id },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  })

  revalidatePath("/app/today")
  revalidatePath("/app/dashboard")
}

/**
 * حذف تسک
 */
export async function deleteTaskAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error("عدم دسترسی")

  const id = formData.get("id") as string

  await prisma.task.delete({
    where: { id, userId: user.id },
  })

  revalidatePath("/app/today")
  revalidatePath("/app/dashboard")
}

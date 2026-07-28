// نمونه اصلاح‌شده متد تغییر وضعیت تسک در Server Actions
export async function toggleTaskStatus(taskId: string, isCompleted: boolean) {
  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        isCompleted,
        // ثبت زمان دقیق انجام در صورت تیک خوردن، یا پاک کردن آن در صورت برداشتن تیک
        completedAt: isCompleted ? new Date() : null,
      },
    });
    
    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Failed to toggle task status:", error);
    return { success: false, error: "خطا در تغییر وضعیت تسک" };
  }
}

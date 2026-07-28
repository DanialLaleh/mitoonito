import { getRemindersAction } from "@/app/actions/reminders";
import ReminderListClient from "@/components/reminders/ReminderListClient";

// غیرفعال کردن کش برای بارگذاری دقیق داده‌های لحظه‌ای دیتابیس
export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const reminders = await getRemindersAction();

  return <ReminderListClient initialReminders={reminders} />;
}

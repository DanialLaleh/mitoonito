import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createGoalAction,
  deleteGoalAction,
  toggleGoalCompletedAction,
  createGoalTaskAction,
} from "@/app/actions/goals";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: {
      tasks: {
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#434345]">اهداف</h1>
        <p className="text-sm text-gray-500 mt-1">
          اهداف بلندمدت و تسک‌های مرتبط با هر هدف را مدیریت کن.
        </p>
      </div>

      <div className="grid gap-6">
        <form action={createGoalAction} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#434345] mb-1">عنوان هدف</label>
            <input
              name="title"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#50B848]"
              placeholder="مثلاً: یادگیری React"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#434345] mb-1">توضیحات</label>
            <textarea
              name="description"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#50B848] min-h-24"
              placeholder="توضیحات اختیاری..."
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[#50B848] text-white px-4 py-3 font-medium hover:bg-[#367639] transition-colors"
          >
            ایجاد هدف
          </button>
        </form>

        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-6 text-center text-gray-500">
              هنوز هدفی ثبت نشده است.
            </div>
          ) : (
            goals.map((goal) => {
              const totalTasks = goal.tasks.length;
              const completedTasks = goal.tasks.filter((task) => task.isCompleted).length;
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div key={goal.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-[#434345]">{goal.title}</h2>
                      {goal.description ? (
                        <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                      ) : null}
                    </div>

                    <form action={toggleGoalCompletedAction}>
                      <input type="hidden" name="goalId" value={goal.id} />
                      <input type="hidden" name="isCompleted" value={String(!goal.isCompleted)} />
                      <button
                        type="submit"
                        className={`rounded-xl px-3 py-2 text-sm font-medium ${
                          goal.isCompleted
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {goal.isCompleted ? "تکمیل شده" : "ناتمام"}
                      </button>
                    </form>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>پیشرفت</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#50B848]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-[#434345]">تسک‌های هدف</h3>
                    {goal.tasks.length === 0 ? (
                      <p className="text-sm text-gray-500">هنوز تسکی برای این هدف ثبت نشده است.</p>
                    ) : (
                      <ul className="space-y-2">
                        {goal.tasks.map((task) => (
                          <li
                            key={task.id}
                            className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-[#434345]">{task.title}</p>
                              {task.dueDate ? (
                                <p className="text-xs text-gray-500">
                                  موعد: {new Date(task.dueDate).toLocaleDateString("fa-IR")}
                                </p>
                              ) : null}
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                task.isCompleted
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {task.isCompleted ? "انجام شده" : "در انتظار"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <form action={createGoalTaskAction} className="space-y-3">
                      <input type="hidden" name="goalId" value={goal.id} />
                      <input
                        name="title"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#50B848]"
                        placeholder="تسک جدید"
                      />
                      <textarea
                        name="description"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#50B848] min-h-20"
                        placeholder="توضیحات تسک"
                      />
                      <input
                        type="datetime-local"
                        name="date"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#50B848]"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[#434345] text-white px-4 py-3 font-medium hover:bg-black transition-colors"
                      >
                        افزودن تسک به هدف
                      </button>
                    </form>

                    <form action={deleteGoalAction} className="flex items-end">
                      <input type="hidden" name="goalId" value={goal.id} />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-red-50 text-red-700 px-4 py-3 font-medium hover:bg-red-100 transition-colors"
                      >
                        حذف هدف
                      </button>
                    </form>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

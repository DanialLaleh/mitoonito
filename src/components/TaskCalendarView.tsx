"use client";

import { useState } from "react";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { toPersianDigits } from "@/lib/format";

type Task = {
  id: string;
  title: string;
  status: string;
  scheduledDate: Date;
};

function toDateOnly(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function TaskCalendarView({ tasks }: { tasks: Task[] }) {
  const [current, setCurrent] = useState(
    new DateObject({ calendar: persian, locale: persian_fa })
  );
  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  const firstOfMonth = new DateObject(current).set("day", 1);
  const startWeekDayIndex = firstOfMonth.weekDay.index;
  const daysInMonth = current.month.length;

  const cells: (DateObject | null)[] = [];
  for (let i = 0; i < startWeekDayIndex; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new DateObject(current).set("day", d));
  }

  const todayObj = new DateObject({ calendar: persian, locale: persian_fa });

  function tasksForDay(dateObj: DateObject) {
    const jsDate = toDateOnly(dateObj.toDate());
    return tasks.filter(
      (t) => toDateOnly(t.scheduledDate).getTime() === jsDate.getTime()
    );
  }

  function isToday(dateObj: DateObject) {
    return dateObj.format("YYYY/MM/DD") === todayObj.format("YYYY/MM/DD");
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrent(new DateObject(current).subtract(1, "month"))
          }
          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ChevronRight size={18} />
        </button>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {current.month.name} {toPersianDigits(current.year)}
        </p>
        <button
          onClick={() => setCurrent(new DateObject(current).add(1, "month"))}
          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 dark:text-gray-500 mb-1">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => (
          <div
            key={i}
            className={`min-h-16 rounded-lg border p-1 text-xs ${
              c && isToday(c)
                ? "border-green-400 dark:border-green-500"
                : "border-gray-100 dark:border-gray-800"
            }`}
          >
            {c && (
              <>
                <div className="text-gray-500 dark:text-gray-400">
                  {toPersianDigits(c.day)}
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  {tasksForDay(c)
                    .slice(0, 3)
                    .map((t) => (
                      <div
                        key={t.id}
                        className={`truncate rounded px-1 ${
                          t.status === "DONE"
                            ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 line-through"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                  {tasksForDay(c).length > 3 && (
                    <div className="text-gray-400 dark:text-gray-500">
                      +{toPersianDigits(tasksForDay(c).length - 3)} مورد دیگه
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

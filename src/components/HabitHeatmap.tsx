"use client";

type HistoryEntry = { date: Date; isFreeze: boolean };

function toDateOnly(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function HabitHeatmap({ history }: { history: HistoryEntry[] }) {
  const map = new Map<number, boolean>(); // timestamp -> isFreeze
  history.forEach((h) => {
    map.set(toDateOnly(h.date).getTime(), h.isFreeze);
  });

  const today = toDateOnly(new Date());
  const days: { date: Date; state: "done" | "freeze" | "empty" }[] = [];

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.getTime();
    let state: "done" | "freeze" | "empty" = "empty";
    if (map.has(key)) {
      state = map.get(key) ? "freeze" : "done";
    }
    days.push({ date: d, state });
  }

  // گروه‌بندی به هفته (ستون‌ها)
  const weeks: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const colorFor = (state: string) => {
    if (state === "done") return "bg-green-500 dark:bg-green-500";
    if (state === "freeze") return "bg-blue-400 dark:bg-blue-500";
    return "bg-gray-100 dark:bg-gray-800";
  };

  return (
    <div className="flex flex-row-reverse gap-1 overflow-x-auto pb-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day, di) => (
            <div
              key={di}
              title={day.date.toLocaleDateString("fa-IR")}
              className={`w-2.5 h-2.5 rounded-sm ${colorFor(day.state)}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

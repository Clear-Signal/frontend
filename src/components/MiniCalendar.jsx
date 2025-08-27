import { useMemo, useState } from "react";

export default function MiniCalendar() {
  const now = new Date();
  const [date, setDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );

  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const monthName = date.toLocaleString(undefined, { month: "long" });

  const days = useMemo(() => {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const prefix = firstDay.getDay(); // 0..6 (Sun..Sat)
    const total = lastDay.getDate();
    const cells = [];

    // blank prefix
    for (let i = 0; i < prefix; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(year, monthIndex, d));
    return cells;
  }, [year, monthIndex]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() =>
            setDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
          }
          className="px-2 py-1 rounded text-[var(--color-fg)]"
        >
          ‹
        </button>

        <div className="text-md font-semibold text-[var(--color-fg)]">
          {monthName} {year}
        </div>

        <button
          type="button"
          onClick={() =>
            setDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
          }
          className="px-2 py-1 rounded text-[var(--color-fg)]"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[14px] text-[var(--text-gray)] mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          if (!d)
            return <div key={i} className="h-8 rounded bg-[transparent]" />;
          // style special for today
          const isToday = new Date().toDateString() === d.toDateString();
          return (
            <button
              key={i}
              type="button"
              className={`h-8 rounded-md text-sm flex items-center justify-center text-[var(--color-fg)] ${
                isToday
                  ? "bg-[var(--color-primary)]/80"
                  : "bg-[#4B5563]"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

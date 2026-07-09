"use client";

import { cn } from "@/utils/cn";
import type { WorkflowTask } from "@/types/workflow";

const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function isSameDate(date: Date, year: number, month: number, day: number) {
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

interface OfficeHubCalendarProps {
  tasks: WorkflowTask[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

export function OfficeHubCalendar({ tasks, selectedDate, onSelectDate }: OfficeHubCalendarProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: Array<Array<number | null>> = [];
  let row: Array<number | null> = Array(firstDayIndex).fill(null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    row.push(day);
    if (row.length === 7 || day === daysInMonth) {
      weeks.push(row);
      row = [];
    }
  }

  const taskCountByDay = new Map<number, number>();
  tasks.forEach((task) => {
    if (!task.deadline) {
      return;
    }

    const deadline = new Date(task.deadline);
    if (deadline.getFullYear() === year && deadline.getMonth() === month) {
      const day = deadline.getDate();
      taskCountByDay.set(day, (taskCountByDay.get(day) ?? 0) + 1);
    }
  });

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 text-center text-[0.7rem] font-semibold text-muted-foreground">
        {dayNames.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2 text-center text-sm">
        {weeks.flat().map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const isToday = isSameDate(now, year, month, day);
          const isSelected = selectedDate ? isSameDate(selectedDate, year, month, day) : false;
          const count = taskCountByDay.get(day) ?? 0;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : new Date(year, month, day))}
              title={count > 0 ? `${count} งานครบกำหนด` : undefined}
              className={cn(
                "relative rounded-lg px-2 py-3 transition",
                isSelected
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : isToday
                    ? "bg-primary/80 text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/70"
              )}
            >
              {day}
              {count > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                    isSelected || isToday ? "bg-primary-foreground" : "bg-destructive"
                  )}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

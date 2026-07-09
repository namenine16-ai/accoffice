import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export function OfficeHubCalendar() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>ปฏิทิน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center text-[0.7rem] font-semibold text-muted-foreground">
          {dayNames.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2 text-center text-sm">
          {weeks.flat().map((day, index) => (
            <div
              key={index}
              className={`rounded-lg px-2 py-3 ${day === now.getDate() ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
            >
              {day ?? ""}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

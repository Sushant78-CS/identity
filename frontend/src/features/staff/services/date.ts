export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function shiftDate(date: string, amount: number) {
  const value = parseLocalDate(date);
  value.setDate(value.getDate() + amount);
  return getLocalDateString(value);
}

/** Returns `count` dates ending at `end` (inclusive), oldest first. */
export function getLastDays(end: string, count: number) {
  return Array.from({ length: count }, (_, i) =>
    shiftDate(end, i - (count - 1)),
  );
}

export function formatDate(date: string) {
  return parseLocalDate(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(date: string) {
  return parseLocalDate(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function formatDayLabel(date: string, today: string) {
  if (date === today) return "Today";
  if (date === shiftDate(today, -1)) return "Yesterday";
  return parseLocalDate(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatWeekdayShort(date: string) {
  return parseLocalDate(date).toLocaleDateString("en-IN", {
    weekday: "short",
  });
}

export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getCalendarDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ] as (number | null)[];
}

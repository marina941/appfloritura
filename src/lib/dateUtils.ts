// Utilitários de data. Datas internas são sempre string ISO "yyyy-MM-dd" (sem fuso).

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** 0 = domingo ... 6 = sábado */
export function nthWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
  n: number,
): Date {
  const first = new Date(year, monthIndex, 1);
  const firstWeekday = first.getDay();
  let offset = weekday - firstWeekday;
  if (offset < 0) offset += 7;
  const day = 1 + offset + (n - 1) * 7;
  return new Date(year, monthIndex, day);
}

export function lastWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
): Date {
  const last = new Date(year, monthIndex + 1, 0);
  const lastWeekday = last.getDay();
  let offset = lastWeekday - weekday;
  if (offset < 0) offset += 7;
  return new Date(year, monthIndex, last.getDate() - offset);
}

/** Algoritmo de Meeus/Jones/Butcher para domingo de Páscoa (calendário gregoriano). */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = março, 4 = abril
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getWeeksInMonth(year: number, monthIndex: number): Date[][] {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const weeks: Date[][] = [];
  let current = startOfWeek(first);
  while (current <= last) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current = addDaysToDate(current, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

const WEEKDAY_NAMES = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function formatLongDate(iso: string): string {
  const date = fromISODate(iso);
  return `${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
}

export function formatWeekdayShort(iso: string): string {
  return WEEKDAY_NAMES[fromISODate(iso).getDay()];
}

export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES[monthIndex];
}

export function isSameISOWeek(isoA: string, weekStart: string): boolean {
  const start = fromISODate(weekStart);
  const end = addDaysToDate(start, 6);
  const target = fromISODate(isoA);
  return target >= start && target <= end;
}

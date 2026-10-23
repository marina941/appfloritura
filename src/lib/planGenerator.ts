import { v4 as uuid } from "uuid";
import type { Format, Objective, Occasion, PlanSettings, Post } from "../types";
import { addDays, fromISODate, toISODate } from "./dateUtils";

const FORMAT_CYCLE: Format[] = [
  "reels",
  "carrossel",
  "estatico",
  "stories",
  "reels",
  "whatsapp",
  "carrossel",
];

function nextFormat(index: number): Format {
  return FORMAT_CYCLE[index % FORMAT_CYCLE.length];
}

function findOccasionForDate(
  date: string,
  occasions: Occasion[],
): Occasion | undefined {
  return occasions.find((o) => {
    const end = o.endDate ?? o.date;
    return date >= o.date && date <= end;
  });
}

/** Ocasião mais próxima no futuro (até `maxLeadDays`) a partir de uma data. */
function findUpcomingOccasion(
  date: string,
  occasions: Occasion[],
  maxLeadDays: number,
): { occasion: Occasion; daysUntil: number } | undefined {
  let best: { occasion: Occasion; daysUntil: number } | undefined;
  for (const o of occasions) {
    const diff =
      (fromISODate(o.date).getTime() - fromISODate(date).getTime()) /
      (1000 * 60 * 60 * 24);
    if (diff >= 0 && diff <= maxLeadDays) {
      if (!best || diff < best.daysUntil) best = { occasion: o, daysUntil: diff };
    }
  }
  return best;
}

/** Ocasião mais recente no passado (até `maxLookbackDays`) a partir de uma data. */
function findRecentOccasion(
  date: string,
  occasions: Occasion[],
  maxLookbackDays: number,
): { occasion: Occasion; daysSince: number } | undefined {
  let best: { occasion: Occasion; daysSince: number } | undefined;
  for (const o of occasions) {
    const end = o.endDate ?? o.date;
    const diff =
      (fromISODate(date).getTime() - fromISODate(end).getTime()) /
      (1000 * 60 * 60 * 24);
    if (diff > 0 && diff <= maxLookbackDays) {
      if (!best || diff < best.daysSince) best = { occasion: o, daysSince: diff };
    }
  }
  return best;
}

const ALL_OBJECTIVES: Objective[] = [
  "alcance",
  "conexao",
  "autoridade",
  "conversao",
  "fidelizacao",
];

function pickWeighted(weights: Record<Objective, number>): Objective {
  const total = ALL_OBJECTIVES.reduce(
    (sum, o) => sum + Math.max(0, weights[o] ?? 0),
    0,
  );
  if (total <= 0) return "conexao";
  let roll = Math.random() * total;
  for (const o of ALL_OBJECTIVES) {
    roll -= Math.max(0, weights[o] ?? 0);
    if (roll <= 0) return o;
  }
  return ALL_OBJECTIVES[ALL_OBJECTIVES.length - 1];
}

function pickObjective(
  date: string,
  occasions: Occasion[],
  objectiveWeights: Record<Objective, number>,
): { objective: Objective; occasionId?: string } {
  const onOccasion = findOccasionForDate(date, occasions);
  if (onOccasion?.isMourning) {
    return { objective: "conexao", occasionId: onOccasion.id };
  }
  if (onOccasion) {
    return { objective: "conversao", occasionId: onOccasion.id };
  }

  const upcoming = findUpcomingOccasion(date, occasions, 7);
  if (upcoming && !upcoming.occasion.isMourning) {
    // Fases do funil: conexão (aquecimento) -> autoridade (educar) -> conversão (vender).
    if (upcoming.daysUntil >= 5) {
      return { objective: "conexao", occasionId: upcoming.occasion.id };
    }
    if (upcoming.daysUntil >= 2) {
      return { objective: "autoridade", occasionId: upcoming.occasion.id };
    }
    return { objective: "conversao", occasionId: upcoming.occasion.id };
  }

  const recent = findRecentOccasion(date, occasions, 3);
  if (recent && !recent.occasion.isMourning) {
    return { objective: "fidelizacao", occasionId: recent.occasion.id };
  }

  return { objective: pickWeighted(objectiveWeights) };
}

function buildPost(date: string, objective: Objective, format: Format, occasionId?: string): Post {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    date,
    objective,
    format,
    occasionId,
    status: "ideia",
    createdAt: now,
    updatedAt: now,
  };
}

/** Distribui `count` dias de postagem dentro de um intervalo [startISO, endISO], espalhados. */
function spreadDates(startISO: string, endISO: string, count: number): string[] {
  const start = fromISODate(startISO);
  const end = fromISODate(endISO);
  const totalDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );
  if (count <= 1) return [startISO];
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const offset = Math.round((i * totalDays) / (count - 1));
    dates.push(addDays(startISO, offset));
  }
  return Array.from(new Set(dates));
}

export interface GeneratePlanOptions {
  settings: PlanSettings;
  occasions: Occasion[];
}

export function generateWeeklyPlan(
  weekStartISO: string,
  postCount: number,
  options: GeneratePlanOptions,
): Post[] {
  const weekEndISO = addDays(weekStartISO, 6);
  const dates = spreadDates(weekStartISO, weekEndISO, postCount);
  const occasionDatesInWeek = options.occasions.filter(
    (o) => (o.endDate ?? o.date) >= weekStartISO && o.date <= weekEndISO,
  );
  const allDates = Array.from(
    new Set([...dates, ...occasionDatesInWeek.map((o) => o.date)]),
  ).sort();

  return allDates.map((date, i) => {
    const { objective, occasionId } = pickObjective(
      date,
      options.occasions,
      options.settings.objectiveWeights,
    );
    return buildPost(date, objective, nextFormat(i), occasionId);
  });
}

export function generateMonthlyPlan(
  year: number,
  monthIndex: number,
  options: GeneratePlanOptions,
): Post[] {
  const monthStart = toISODate(new Date(year, monthIndex, 1));
  const monthEnd = toISODate(new Date(year, monthIndex + 1, 0));
  const totalDaysInMonth = fromISODate(monthEnd).getDate();
  const weeksInMonth = Math.ceil(totalDaysInMonth / 7);
  const avgPerWeek = Math.round(
    (options.settings.postsPerWeekMin + options.settings.postsPerWeekMax) / 2,
  );
  const targetCount = Math.max(4, weeksInMonth * avgPerWeek);

  const dates = spreadDates(monthStart, monthEnd, targetCount);
  const occasionDatesInMonth = options.occasions.filter(
    (o) => (o.endDate ?? o.date) >= monthStart && o.date <= monthEnd,
  );
  const allDates = Array.from(
    new Set([...dates, ...occasionDatesInMonth.map((o) => o.date)]),
  ).sort();

  return allDates.map((date, i) => {
    const { objective, occasionId } = pickObjective(
      date,
      options.occasions,
      options.settings.objectiveWeights,
    );
    return buildPost(date, objective, nextFormat(i), occasionId);
  });
}

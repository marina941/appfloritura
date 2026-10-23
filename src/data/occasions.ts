import type { Occasion, OccasionTone } from "../types";
import {
  addDaysToDate,
  getEasterSunday,
  nthWeekdayOfMonth,
  toISODate,
} from "../lib/dateUtils";

/**
 * Calendário fixo de datas comemorativas para A Floritura, calculado para um
 * ano específico (algumas datas são móveis: Carnaval depende da Páscoa;
 * Dia das Mães/Pais são o 2º domingo de maio/agosto; Black Friday é a sexta
 * depois da 4ª quinta de novembro).
 */
export function getFixedOccasions(year: number): Occasion[] {
  const easter = getEasterSunday(year);
  const carnivalTuesday = addDaysToDate(easter, -47);
  const carnivalSaturday = addDaysToDate(carnivalTuesday, -3);

  const mothersDay = nthWeekdayOfMonth(year, 4, 0, 2); // maio, domingo, 2ª ocorrência
  const fathersDay = nthWeekdayOfMonth(year, 7, 0, 2); // agosto, domingo, 2ª ocorrência
  const fourthThursdayNov = nthWeekdayOfMonth(year, 10, 4, 4);
  const blackFriday = addDaysToDate(fourthThursdayNov, 1);

  const fixed: Array<{
    id: string;
    name: string;
    date: Date;
    endDate?: Date;
    tone: OccasionTone;
    isMourning?: boolean;
  }> = [
    { id: "carnaval", name: "Carnaval de Recife e Olinda", date: carnivalSaturday, endDate: carnivalTuesday, tone: "festivo" },
    { id: "mulheres", name: "Dia das Mulheres", date: new Date(year, 2, 8), tone: "emocional" },
    { id: "maes", name: "Dia das Mães", date: mothersDay, tone: "emocional" },
    { id: "namorados", name: "Dia dos Namorados", date: new Date(year, 5, 12), tone: "romantico" },
    { id: "santo-antonio", name: "Santo Antônio", date: new Date(year, 5, 13), tone: "romantico" },
    { id: "sao-joao", name: "São João", date: new Date(year, 5, 24), tone: "festivo" },
    { id: "pais", name: "Dia dos Pais", date: fathersDay, tone: "emocional" },
    { id: "avos", name: "Dia dos Avós", date: new Date(year, 6, 26), tone: "alegre" },
    { id: "cliente", name: "Dia do Cliente", date: new Date(year, 8, 15), tone: "alegre" },
    { id: "criancas", name: "Dia das Crianças", date: new Date(year, 9, 12), tone: "alegre" },
    { id: "finados", name: "Finados", date: new Date(year, 10, 2), tone: "luto", isMourning: true },
    { id: "black-friday", name: "Black Friday", date: blackFriday, tone: "padrao" },
    { id: "natal", name: "Natal", date: new Date(year, 11, 25), tone: "alegre" },
    { id: "reveillon", name: "Réveillon", date: new Date(year, 11, 31), tone: "festivo" },
  ];

  return fixed.map((occasion) => ({
    id: `${occasion.id}-${year}`,
    name: occasion.name,
    date: toISODate(occasion.date),
    endDate: occasion.endDate ? toISODate(occasion.endDate) : undefined,
    tone: occasion.tone,
    isMourning: occasion.isMourning,
  }));
}

/** Todas as ocasiões (fixas + personalizadas) que tocam o intervalo [startISO, endISO]. */
export function getAllOccasionsInRange(
  startISO: string,
  endISO: string,
  customOccasions: Occasion[],
): Occasion[] {
  const startYear = Number(startISO.slice(0, 4));
  const endYear = Number(endISO.slice(0, 4));
  const fixed: Occasion[] = [];
  for (let y = startYear - 1; y <= endYear + 1; y++) {
    fixed.push(...getFixedOccasions(y));
  }
  const all = [...fixed, ...customOccasions];
  return all
    .filter((o) => (o.endDate ?? o.date) >= startISO && o.date <= endISO)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const TONE_LABELS: Record<OccasionTone, string> = {
  romantico: "Romântico com graça",
  festivo: "Festivo, orgulho das raízes",
  emocional: "Emocional e sincero",
  alegre: "Alegre e leve",
  luto: "Sóbrio, sem humor, sem emoji",
  "ultima-hora": "Tranquilizador e prático",
  padrao: "Padrão da marca",
};

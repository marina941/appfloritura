import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { usePlanStore } from "../../store/usePlanStore";
import { getAllOccasionsInRange, TONE_LABELS } from "../../data/occasions";
import type { Objective, OccasionTone, PeriodMode } from "../../types";
import { generateMonthlyPlan, generateWeeklyPlan } from "../../lib/planGenerator";
import { OBJECTIVE_LABELS } from "../../lib/labels";
import {
  addDays,
  formatLongDate,
  getMonthName,
  startOfWeek,
  toISODate,
} from "../../lib/dateUtils";
import { Pill } from "../common/Pill";

const MONTHS = Array.from({ length: 12 }, (_, i) => i);
const TONE_OPTIONS: OccasionTone[] = [
  "padrao",
  "romantico",
  "festivo",
  "emocional",
  "alegre",
  "luto",
  "ultima-hora",
];

export function PlanningView({ onPlanGenerated }: { onPlanGenerated: () => void }) {
  const { settings, updateSettings, customOccasions, addCustomOccasion, removeCustomOccasion, addPosts } =
    usePlanStore();

  const [periodMode, setPeriodMode] = useState<PeriodMode>("mensal");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [weekAnchor, setWeekAnchor] = useState(toISODate(today));
  const [weeklyCount, setWeeklyCount] = useState(5);

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customTone, setCustomTone] = useState<OccasionTone>("padrao");

  const periodRange = useMemo(() => {
    if (periodMode === "mensal") {
      const start = toISODate(new Date(year, monthIndex, 1));
      const end = toISODate(new Date(year, monthIndex + 1, 0));
      return { start, end };
    }
    const weekStart = toISODate(startOfWeek(new Date(weekAnchor)));
    const weekEnd = addDays(weekStart, 6);
    return { start: weekStart, end: weekEnd };
  }, [periodMode, year, monthIndex, weekAnchor]);

  const occasionsInPeriod = useMemo(
    () => getAllOccasionsInRange(periodRange.start, periodRange.end, customOccasions),
    [periodRange, customOccasions],
  );

  const totalWeight = useMemo(
    () => Object.values(settings.objectiveWeights).reduce((a, b) => a + b, 0),
    [settings.objectiveWeights],
  );

  function handleAddCustomOccasion() {
    if (!customName.trim() || !customDate) return;
    addCustomOccasion({
      id: uuid(),
      name: customName.trim(),
      date: customDate,
      tone: customTone,
      isCustom: true,
      isMourning: customTone === "luto",
    });
    setCustomName("");
    setCustomDate("");
    setCustomTone("padrao");
    setShowCustomForm(false);
  }

  function handleGenerate() {
    const occasions = getAllOccasionsInRange(
      periodMode === "mensal" ? toISODate(new Date(year, 0, 1)) : periodRange.start,
      periodMode === "mensal" ? toISODate(new Date(year, 11, 31)) : periodRange.end,
      customOccasions,
    );
    const posts =
      periodMode === "mensal"
        ? generateMonthlyPlan(year, monthIndex, { settings, occasions })
        : generateWeeklyPlan(
            toISODate(startOfWeek(new Date(weekAnchor))),
            weeklyCount,
            { settings, occasions },
          );
    addPosts(posts);
    onPlanGenerated();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-medium text-leaf">Planejar programação de posts</h1>
        <p className="text-sm text-ink/70">
          Escolha o período e a gente sugere a distribuição de posts entre as 5 intenções
          de conteúdo: alcance, conexão, autoridade, conversão e fidelização.
        </p>
      </div>

      {/* Período */}
      <section className="rounded-card bg-card p-4 space-y-4">
        <div className="flex gap-2">
          <Pill
            variant={periodMode === "mensal" ? "secondary" : "ghost"}
            onClick={() => setPeriodMode("mensal")}
          >
            Mensal
          </Pill>
          <Pill
            variant={periodMode === "semanal" ? "secondary" : "ghost"}
            onClick={() => setPeriodMode("semanal")}
          >
            Semanal
          </Pill>
        </div>

        {periodMode === "mensal" ? (
          <div className="flex flex-wrap gap-3">
            <select
              className="rounded-pill border border-sage/40 px-3 py-2 text-sm bg-white"
              value={monthIndex}
              onChange={(e) => setMonthIndex(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="w-24 rounded-pill border border-sage/40 px-3 py-2 text-sm bg-white"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-ink/70">Escolha um dia dentro da semana:</label>
            <input
              type="date"
              className="rounded-pill border border-sage/40 px-3 py-2 text-sm bg-white"
              value={weekAnchor}
              onChange={(e) => setWeekAnchor(e.target.value)}
            />
            <label className="text-sm text-ink/70">Quantidade de posts:</label>
            <input
              type="number"
              min={3}
              max={7}
              className="w-20 rounded-pill border border-sage/40 px-3 py-2 text-sm bg-white"
              value={weeklyCount}
              onChange={(e) => setWeeklyCount(Number(e.target.value))}
            />
          </div>
        )}

        {periodMode === "mensal" && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-ink/70">Posts por semana:</span>
            <input
              type="number"
              min={1}
              max={7}
              value={settings.postsPerWeekMin}
              onChange={(e) =>
                updateSettings({ postsPerWeekMin: Number(e.target.value) })
              }
              className="w-16 rounded-pill border border-sage/40 px-2 py-1.5 bg-white"
            />
            <span>a</span>
            <input
              type="number"
              min={1}
              max={7}
              value={settings.postsPerWeekMax}
              onChange={(e) =>
                updateSettings({ postsPerWeekMax: Number(e.target.value) })
              }
              className="w-16 rounded-pill border border-sage/40 px-2 py-1.5 bg-white"
            />
          </div>
        )}
      </section>

      {/* Equilíbrio de objetivo */}
      <section className="rounded-card bg-card p-4 space-y-3">
        <h2 className="text-sm font-medium text-leaf">Equilíbrio de objetivo</h2>
        <div className="space-y-2">
          {(Object.keys(settings.objectiveWeights) as Objective[]).map((obj) => {
            const weight = settings.objectiveWeights[obj];
            const percent =
              totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0;
            return (
              <div key={obj} className="flex items-center gap-3 text-xs">
                <span className="w-20 shrink-0 text-ink/70">{OBJECTIVE_LABELS[obj]}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weight}
                  onChange={(e) =>
                    updateSettings({
                      objectiveWeights: {
                        ...settings.objectiveWeights,
                        [obj]: Number(e.target.value),
                      },
                    })
                  }
                  className="flex-1 accent-magenta"
                />
                <span className="w-10 shrink-0 text-right text-ink/60">{percent}%</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-ink/60">
          Perto de datas comemorativas, a fase do funil (conexão → autoridade → conversão
          → fidelização) é ajustada automaticamente.
        </p>
      </section>

      {/* Datas comemorativas no período */}
      <section className="rounded-card bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-leaf">Datas comemorativas no período</h2>
          <button
            onClick={() => setShowCustomForm((s) => !s)}
            className="flex items-center gap-1 text-xs font-medium text-magenta"
          >
            <Plus className="h-3.5 w-3.5" /> Data personalizada
          </button>
        </div>

        {showCustomForm && (
          <div className="flex flex-wrap items-end gap-2 rounded-card bg-white p-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink/60">Nome</label>
              <input
                className="rounded-pill border border-sage/40 px-3 py-1.5 text-sm"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ex.: Aniversário da loja"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink/60">Data</label>
              <input
                type="date"
                className="rounded-pill border border-sage/40 px-3 py-1.5 text-sm"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink/60">Tom</label>
              <select
                className="rounded-pill border border-sage/40 px-3 py-1.5 text-sm"
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value as OccasionTone)}
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {TONE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <Pill variant="primary" onClick={handleAddCustomOccasion}>
              Adicionar
            </Pill>
          </div>
        )}

        {occasionsInPeriod.length === 0 ? (
          <p className="text-xs text-ink/50">Nenhuma data comemorativa neste período.</p>
        ) : (
          <ul className="space-y-1.5">
            {occasionsInPeriod.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-card bg-white px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-medium text-leaf">{o.name}</span>{" "}
                  <span className="text-ink/60">
                    — {formatLongDate(o.date)}
                    {o.endDate ? ` a ${formatLongDate(o.endDate)}` : ""}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-ink/50">{TONE_LABELS[o.tone]}</span>
                  {o.isCustom && (
                    <button onClick={() => removeCustomOccasion(o.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-ink/40 hover:text-magenta" />
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Pill variant="primary" onClick={handleGenerate} className="w-full py-3 text-base">
        <Sparkles className="h-4 w-4" /> Gerar programação sugerida
      </Pill>
    </div>
  );
}

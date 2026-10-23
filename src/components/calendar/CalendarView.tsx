import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { usePlanStore } from "../../store/usePlanStore";
import { getAllOccasionsInRange } from "../../data/occasions";
import {
  addDaysToDate,
  getMonthName,
  getWeeksInMonth,
  startOfWeek,
  toISODate,
} from "../../lib/dateUtils";
import { PostCard } from "../common/PostCard";
import { OccasionBadge } from "../common/Badge";
import type { Post } from "../../types";

const WEEKDAY_HEADERS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function CalendarView({ onSelectPost }: { onSelectPost: (post: Post) => void }) {
  const { posts, customOccasions, addPost } = usePlanStore();
  const [mode, setMode] = useState<"mes" | "semana">("mes");
  const [anchor, setAnchor] = useState(new Date());

  const year = anchor.getFullYear();
  const monthIndex = anchor.getMonth();

  const weeks = useMemo(() => {
    if (mode === "mes") return getWeeksInMonth(year, monthIndex);
    const start = startOfWeek(anchor);
    return [Array.from({ length: 7 }, (_, i) => addDaysToDate(start, i))];
  }, [mode, year, monthIndex, anchor]);

  const rangeStart = toISODate(weeks[0][0]);
  const rangeEnd = toISODate(weeks[weeks.length - 1][6]);
  const occasions = useMemo(
    () => getAllOccasionsInRange(rangeStart, rangeEnd, customOccasions),
    [rangeStart, rangeEnd, customOccasions],
  );

  function postsOnDate(iso: string) {
    return posts.filter((p) => p.date === iso);
  }

  function occasionOnDate(iso: string) {
    return occasions.find((o) => iso >= o.date && iso <= (o.endDate ?? o.date));
  }

  function handleNavigate(direction: -1 | 1) {
    if (mode === "mes") {
      setAnchor(new Date(year, monthIndex + direction, 1));
    } else {
      setAnchor(addDaysToDate(anchor, direction * 7));
    }
  }

  function handleAddPost(iso: string) {
    const now = new Date().toISOString();
    const post: Post = {
      id: uuid(),
      date: iso,
      objective: "conexao",
      format: "estatico",
      status: "ideia",
      createdAt: now,
      updatedAt: now,
    };
    addPost(post);
    onSelectPost(post);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => handleNavigate(-1)} className="rounded-pill p-1.5 hover:bg-sage-light">
            <ChevronLeft className="h-4 w-4 text-leaf" />
          </button>
          <h2 className="min-w-[180px] text-center text-base font-medium text-leaf">
            {mode === "mes"
              ? `${getMonthName(monthIndex)} de ${year}`
              : `Semana de ${toISODate(weeks[0][0])}`}
          </h2>
          <button onClick={() => handleNavigate(1)} className="rounded-pill p-1.5 hover:bg-sage-light">
            <ChevronRight className="h-4 w-4 text-leaf" />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setMode("mes")}
            className={`rounded-pill px-3 py-1.5 text-sm ${mode === "mes" ? "bg-sage text-white" : "bg-sage-light text-leaf"}`}
          >
            Mês
          </button>
          <button
            onClick={() => setMode("semana")}
            className={`rounded-pill px-3 py-1.5 text-sm ${mode === "semana" ? "bg-sage text-white" : "bg-sage-light text-leaf"}`}
          >
            Semana
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-card bg-sage/15">
        {WEEKDAY_HEADERS.map((d) => (
          <div key={d} className="bg-sage-light py-1.5 text-center text-xs font-medium text-leaf">
            {d}
          </div>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const iso = toISODate(day);
            const inMonth = mode === "semana" || day.getMonth() === monthIndex;
            const occasion = occasionOnDate(iso);
            const dayPosts = postsOnDate(iso);
            return (
              <div
                key={`${wi}-${di}`}
                className={`min-h-[120px] space-y-1 bg-white p-1.5 ${inMonth ? "" : "opacity-40"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink/60">{day.getDate()}</span>
                  <button
                    onClick={() => handleAddPost(iso)}
                    title="Adicionar post"
                    className="rounded-full p-0.5 text-sage hover:bg-sage-light"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                {occasion && (
                  <div>
                    <OccasionBadge name={occasion.name} />
                  </div>
                )}
                {dayPosts.map((p) => (
                  <PostCard key={p.id} post={p} onClick={() => onSelectPost(p)} />
                ))}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

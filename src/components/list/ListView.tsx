import { useMemo, useState } from "react";
import { usePlanStore } from "../../store/usePlanStore";
import type { Format, Objective, Post, PostStatus } from "../../types";
import { FORMAT_LABELS, OBJECTIVE_LABELS, STATUS_LABELS, STATUS_ORDER } from "../../lib/labels";
import { formatLongDate } from "../../lib/dateUtils";
import { ObjectiveBadge } from "../common/Badge";

export function ListView({ onSelectPost }: { onSelectPost: (post: Post) => void }) {
  const posts = usePlanStore((s) => s.posts);
  const [objectiveFilter, setObjectiveFilter] = useState<Objective | "todos">("todos");
  const [formatFilter, setFormatFilter] = useState<Format | "todos">("todos");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "todos">("todos");

  const filtered = useMemo(() => {
    return posts
      .filter((p) => objectiveFilter === "todos" || p.objective === objectiveFilter)
      .filter((p) => formatFilter === "todos" || p.format === formatFilter)
      .filter((p) => statusFilter === "todos" || p.status === statusFilter)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [posts, objectiveFilter, formatFilter, statusFilter]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          className="rounded-pill border border-sage/40 bg-white px-3 py-1.5 text-sm"
          value={objectiveFilter}
          onChange={(e) => setObjectiveFilter(e.target.value as Objective | "todos")}
        >
          <option value="todos">Todos os objetivos</option>
          {Object.entries(OBJECTIVE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="rounded-pill border border-sage/40 bg-white px-3 py-1.5 text-sm"
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value as Format | "todos")}
        >
          <option value="todos">Todos os formatos</option>
          {Object.entries(FORMAT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="rounded-pill border border-sage/40 bg-white px-3 py-1.5 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PostStatus | "todos")}
        >
          <option value="todos">Todos os status</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink/50">Nenhum post encontrado. Gere uma programação primeiro.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((post) => (
            <li key={post.id}>
              <button
                onClick={() => onSelectPost(post)}
                className="flex w-full items-center justify-between gap-3 rounded-card bg-card px-4 py-3 text-left hover:bg-sage-light/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-leaf">
                    {post.idea?.title ?? "Ideia não gerada"}
                  </p>
                  <p className="text-xs text-ink/60">{formatLongDate(post.date)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ObjectiveBadge objective={post.objective} />
                  <span className="rounded-pill bg-white px-2.5 py-0.5 text-xs text-leaf">
                    {FORMAT_LABELS[post.format]}
                  </span>
                  <span className="rounded-pill bg-white px-2.5 py-0.5 text-xs text-ink/70">
                    {STATUS_LABELS[post.status]}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

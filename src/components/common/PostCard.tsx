import type { Post } from "../../types";
import { FORMAT_LABELS, OBJECTIVE_COLORS, STATUS_LABELS } from "../../lib/labels";

export function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const colors = OBJECTIVE_COLORS[post.objective];
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-card border p-2.5 text-left text-xs shadow-sm transition-transform hover:-translate-y-0.5 ${colors.cardBg} ${colors.border}`}
    >
      <p className="font-medium text-leaf line-clamp-2">
        {post.idea?.title ?? "Ideia não gerada"}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-pill px-2 py-0.5 text-white ${colors.pill}`}>
          {FORMAT_LABELS[post.format]}
        </span>
        <span className="rounded-pill bg-white/70 px-2 py-0.5 text-ink/70">
          {STATUS_LABELS[post.status]}
        </span>
      </div>
    </button>
  );
}

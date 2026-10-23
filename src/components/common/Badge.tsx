import type { Objective } from "../../types";
import { OBJECTIVE_COLORS, OBJECTIVE_LABELS } from "../../lib/labels";

export function ObjectiveBadge({ objective }: { objective: Objective }) {
  return (
    <span
      className={`inline-block rounded-pill px-2.5 py-0.5 text-xs font-medium ${OBJECTIVE_COLORS[objective].badge}`}
    >
      {OBJECTIVE_LABELS[objective]}
    </span>
  );
}

export function OccasionBadge({ name }: { name: string }) {
  return (
    <span className="inline-block rounded-pill bg-magenta px-2.5 py-0.5 text-xs font-medium text-white">
      {name}
    </span>
  );
}

import { Check, X } from "lucide-react";
import type { ToneCheckResult } from "../../types";

export function ToneChecklistPanel({ result }: { result: ToneCheckResult }) {
  return (
    <section className="rounded-card bg-card p-4 space-y-2">
      <h3 className="text-sm font-semibold text-leaf">Revisão de tom de voz</h3>
      <ul className="space-y-1.5">
        {result.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm">
            {item.passed ? (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
            ) : (
              <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-magenta" />
            )}
            <div>
              <p className={item.passed ? "text-ink/70" : "text-ink"}>{item.label}</p>
              {!item.passed && item.suggestion && (
                <p className="text-xs text-magenta/80">{item.suggestion}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      {!result.allPassed && (
        <p className="text-xs font-medium text-magenta">
          Ajuste os itens marcados antes de aprovar o post.
        </p>
      )}
    </section>
  );
}

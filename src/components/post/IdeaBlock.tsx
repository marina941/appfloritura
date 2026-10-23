import type { Idea } from "../../types";
import { GenerationControls, type Refinement } from "./GenerationControls";

export function IdeaBlock({
  idea,
  loading,
  error,
  onGenerate,
  onChange,
}: {
  idea?: Idea;
  loading: boolean;
  error?: string;
  onGenerate: (refinement: Refinement) => void;
  onChange: (idea: Idea) => void;
}) {
  function handleCopy() {
    if (!idea) return;
    const text = `${idea.title}\n\n${idea.concept}`;
    navigator.clipboard.writeText(text);
  }

  return (
    <section className="rounded-card bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-leaf">1. Ideia</h3>
        <GenerationControls
          loading={loading}
          hasContent={Boolean(idea)}
          onGenerate={() => onGenerate(null)}
          onRefine={onGenerate}
          onCopy={handleCopy}
        />
      </div>
      {error && <p className="text-xs text-magenta">{error}</p>}
      {idea && (
        <div className="space-y-2">
          <input
            className="w-full rounded-card border border-sage/30 bg-white px-3 py-2 text-sm font-medium text-leaf"
            value={idea.title}
            onChange={(e) => onChange({ ...idea, title: e.target.value })}
          />
          <textarea
            className="w-full rounded-card border border-sage/30 bg-white px-3 py-2 text-sm"
            rows={3}
            value={idea.concept}
            onChange={(e) => onChange({ ...idea, concept: e.target.value })}
            placeholder="Conceito em 2 ou 3 frases"
          />
          <textarea
            className="w-full rounded-card border border-sage/20 bg-white/60 px-3 py-2 text-xs text-ink/70"
            rows={2}
            value={idea.why}
            onChange={(e) => onChange({ ...idea, why: e.target.value })}
            placeholder="Por que esse post serve ao objetivo"
          />
        </div>
      )}
      {!idea && !loading && (
        <p className="text-xs text-ink/50">Clique em "Gerar" para criar a ideia deste post.</p>
      )}
    </section>
  );
}

import { GenerationControls, type Refinement } from "./GenerationControls";

export function CaptionBlock({
  caption,
  loading,
  error,
  disabled,
  onGenerate,
  onChange,
}: {
  caption?: string;
  loading: boolean;
  error?: string;
  disabled?: boolean;
  onGenerate: (refinement: Refinement) => void;
  onChange: (caption: string) => void;
}) {
  return (
    <section className="rounded-card bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-leaf">3. Legenda</h3>
        <GenerationControls
          disabled={disabled}
          loading={loading}
          hasContent={Boolean(caption)}
          onGenerate={() => onGenerate(null)}
          onRefine={onGenerate}
          onCopy={() => caption && navigator.clipboard.writeText(caption)}
        />
      </div>
      {error && <p className="text-xs text-magenta">{error}</p>}
      {disabled && !caption && (
        <p className="text-xs text-ink/50">Gere a ideia primeiro.</p>
      )}
      {caption !== undefined && (
        <textarea
          className="w-full rounded-card border border-sage/30 bg-white px-3 py-2 text-sm whitespace-pre-wrap"
          rows={8}
          value={caption}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </section>
  );
}

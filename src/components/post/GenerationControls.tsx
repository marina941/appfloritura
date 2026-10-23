import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";

export type Refinement = "mais-emocional" | "mais-vendedor" | "mais-curto" | null;

export function GenerationControls({
  disabled,
  loading,
  hasContent,
  onGenerate,
  onRefine,
  onCopy,
}: {
  disabled?: boolean;
  loading: boolean;
  hasContent: boolean;
  onGenerate: () => void;
  onRefine: (refinement: Refinement) => void;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        disabled={disabled || loading}
        onClick={onGenerate}
        className="flex items-center gap-1 rounded-pill bg-sage px-3 py-1.5 text-xs font-medium text-white hover:bg-sage/90 disabled:opacity-50"
      >
        {hasContent ? (
          <RotateCcw className="h-3 w-3" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {loading ? "Gerando..." : hasContent ? "Gerar de novo" : "Gerar"}
      </button>
      {hasContent && (
        <>
          <button
            disabled={disabled || loading}
            onClick={() => onRefine("mais-emocional")}
            className="rounded-pill bg-sage-light px-3 py-1.5 text-xs font-medium text-leaf hover:bg-sage/15 disabled:opacity-50"
          >
            Mais emocional
          </button>
          <button
            disabled={disabled || loading}
            onClick={() => onRefine("mais-vendedor")}
            className="rounded-pill bg-sage-light px-3 py-1.5 text-xs font-medium text-leaf hover:bg-sage/15 disabled:opacity-50"
          >
            Mais vendedor
          </button>
          <button
            disabled={disabled || loading}
            onClick={() => onRefine("mais-curto")}
            className="rounded-pill bg-sage-light px-3 py-1.5 text-xs font-medium text-leaf hover:bg-sage/15 disabled:opacity-50"
          >
            Mais curto
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-pill bg-magenta-light px-3 py-1.5 text-xs font-medium text-magenta hover:bg-magenta/15"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </>
      )}
    </div>
  );
}

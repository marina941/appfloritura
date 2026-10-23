import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import type { Format, Objective, Post, Script } from "../../types";
import { usePlanStore } from "../../store/usePlanStore";
import { generateCaption, generateIdea, generateScript } from "../../lib/api";
import { runToneChecklist } from "../../lib/toneChecklist";
import { FORMAT_LABELS, OBJECTIVE_LABELS, STATUS_LABELS, STATUS_ORDER } from "../../lib/labels";
import { addDays, formatLongDate } from "../../lib/dateUtils";
import { getAllOccasionsInRange } from "../../data/occasions";
import { IdeaBlock } from "./IdeaBlock";
import { ScriptBlock } from "./ScriptBlock";
import { CaptionBlock } from "./CaptionBlock";
import { ToneChecklistPanel } from "./ToneChecklistPanel";
import type { Refinement } from "./GenerationControls";
import { Pill } from "../common/Pill";

export function PostEditorModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const { updatePost, removePost, setStatus, customOccasions, recentIdeaTitles, addRecentTitle } =
    usePlanStore();

  const [ideaLoading, setIdeaLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [ideaError, setIdeaError] = useState<string>();
  const [scriptError, setScriptError] = useState<string>();
  const [captionError, setCaptionError] = useState<string>();

  const occasion = post.occasionId
    ? getAllOccasionsInRange(
        addDays(post.date, -10),
        addDays(post.date, 10),
        customOccasions,
      ).find((o) => o.id === post.occasionId)
    : undefined;

  async function handleGenerateIdea(refinement: Refinement) {
    setIdeaLoading(true);
    setIdeaError(undefined);
    try {
      const idea = await generateIdea({
        kind: "idea",
        objective: post.objective,
        format: post.format,
        date: post.date,
        occasionName: occasion?.name,
        occasionTone: occasion?.tone,
        refinement,
        previousIdea: post.idea,
        recentTitles: recentIdeaTitles,
      });
      updatePost(post.id, { idea, script: undefined, caption: undefined, toneCheck: undefined });
      addRecentTitle(idea.title);
    } catch (e) {
      setIdeaError(e instanceof Error ? e.message : "Erro ao gerar ideia.");
    } finally {
      setIdeaLoading(false);
    }
  }

  async function handleGenerateScript(refinement: Refinement) {
    if (!post.idea) return;
    setScriptLoading(true);
    setScriptError(undefined);
    try {
      const script = await generateScript({
        kind: "script",
        objective: post.objective,
        format: post.format,
        idea: post.idea,
        refinement,
        previousScript: post.script,
      });
      updatePost(post.id, { script, toneCheck: undefined });
    } catch (e) {
      setScriptError(e instanceof Error ? e.message : "Erro ao gerar roteiro.");
    } finally {
      setScriptLoading(false);
    }
  }

  async function handleGenerateCaption(refinement: Refinement) {
    if (!post.idea) return;
    setCaptionLoading(true);
    setCaptionError(undefined);
    try {
      const caption = await generateCaption({
        kind: "caption",
        objective: post.objective,
        format: post.format,
        idea: post.idea,
        refinement,
        previousCaption: post.caption,
      });
      updatePost(post.id, { caption, toneCheck: undefined });
    } catch (e) {
      setCaptionError(e instanceof Error ? e.message : "Erro ao gerar legenda.");
    } finally {
      setCaptionLoading(false);
    }
  }

  function handleRunChecklist() {
    const result = runToneChecklist(post);
    updatePost(post.id, { toneCheck: result });
    return result;
  }

  function handleApprove() {
    const result = runToneChecklist(post);
    updatePost(post.id, { toneCheck: result });
    if (result.allPassed) {
      setStatus(post.id, "aprovado");
    }
  }

  function handleDelete() {
    removePost(post.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-leaf/40 p-4">
      <div className="my-6 w-full max-w-2xl rounded-card bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-sage/15 px-5 py-3">
          <div>
            <p className="text-sm font-medium text-leaf">{formatLongDate(post.date)}</p>
            {occasion && <p className="text-xs text-magenta">{occasion.name}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} title="Excluir post">
              <Trash2 className="h-4 w-4 text-ink/40 hover:text-magenta" />
            </button>
            <button onClick={onClose}>
              <X className="h-5 w-5 text-ink/40 hover:text-ink" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {/* Objetivo, formato, status */}
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-xs text-ink/60">
              Objetivo
              <select
                className="rounded-pill border border-sage/40 bg-white px-2 py-1.5 text-sm text-ink"
                value={post.objective}
                onChange={(e) => updatePost(post.id, { objective: e.target.value as Objective })}
              >
                {Object.entries(OBJECTIVE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-ink/60">
              Formato
              <select
                className="rounded-pill border border-sage/40 bg-white px-2 py-1.5 text-sm text-ink"
                value={post.format}
                onChange={(e) =>
                  updatePost(post.id, {
                    format: e.target.value as Format,
                    script: undefined,
                  })
                }
              >
                {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-ink/60">
              Status
              <select
                className="rounded-pill border border-sage/40 bg-white px-2 py-1.5 text-sm text-ink"
                value={post.status}
                onChange={(e) => setStatus(post.id, e.target.value as Post["status"])}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <IdeaBlock
            idea={post.idea}
            loading={ideaLoading}
            error={ideaError}
            onGenerate={handleGenerateIdea}
            onChange={(idea) => updatePost(post.id, { idea })}
          />

          <ScriptBlock
            script={post.script}
            loading={scriptLoading}
            error={scriptError}
            disabled={!post.idea}
            onGenerate={handleGenerateScript}
            onChange={(script: Script) => updatePost(post.id, { script })}
          />

          <CaptionBlock
            caption={post.caption}
            loading={captionLoading}
            error={captionError}
            disabled={!post.idea}
            onGenerate={handleGenerateCaption}
            onChange={(caption) => updatePost(post.id, { caption })}
          />

          {post.toneCheck ? (
            <ToneChecklistPanel result={post.toneCheck} />
          ) : (
            <Pill variant="ghost" onClick={handleRunChecklist} disabled={!post.caption}>
              Revisar tom de voz
            </Pill>
          )}

          <div className="flex justify-end gap-2 border-t border-sage/15 pt-4">
            <Pill variant="ghost" onClick={onClose}>
              Fechar
            </Pill>
            <Pill
              variant="primary"
              onClick={handleApprove}
              disabled={!post.caption || post.status === "aprovado"}
            >
              Marcar como Aprovado
            </Pill>
          </div>
        </div>
      </div>
    </div>
  );
}

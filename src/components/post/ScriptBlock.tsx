import type { Script } from "../../types";
import { scriptToText } from "../../lib/scriptFormat";
import { GenerationControls, type Refinement } from "./GenerationControls";

function ReelsEditor({ script, onChange }: { script: Extract<Script, { format: "reels" }>; onChange: (s: Script) => void }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs text-ink/60">
        Duração (s)
        <input
          type="number"
          className="w-16 rounded-pill border border-sage/30 bg-white px-2 py-1"
          value={script.durationSeconds}
          onChange={(e) => onChange({ ...script, durationSeconds: Number(e.target.value) })}
        />
      </label>
      {script.scenes.map((scene, i) => (
        <div key={i} className="rounded-card border border-sage/20 bg-white p-2.5 space-y-1.5">
          <input
            className="w-28 rounded-pill border border-sage/30 px-2 py-1 text-xs font-medium"
            value={scene.time}
            onChange={(e) => {
              const scenes = [...script.scenes];
              scenes[i] = { ...scene, time: e.target.value };
              onChange({ ...script, scenes });
            }}
          />
          <textarea
            className="w-full rounded-card border border-sage/20 px-2 py-1.5 text-xs"
            rows={1}
            placeholder="O que aparece na tela"
            value={scene.visual}
            onChange={(e) => {
              const scenes = [...script.scenes];
              scenes[i] = { ...scene, visual: e.target.value };
              onChange({ ...script, scenes });
            }}
          />
          <textarea
            className="w-full rounded-card border border-sage/20 px-2 py-1.5 text-xs"
            rows={1}
            placeholder="Texto na tela"
            value={scene.onScreenText}
            onChange={(e) => {
              const scenes = [...script.scenes];
              scenes[i] = { ...scene, onScreenText: e.target.value };
              onChange({ ...script, scenes });
            }}
          />
          <input
            className="w-full rounded-pill border border-sage/20 px-2 py-1 text-xs"
            placeholder="Sugestão de áudio"
            value={scene.audio}
            onChange={(e) => {
              const scenes = [...script.scenes];
              scenes[i] = { ...scene, audio: e.target.value };
              onChange({ ...script, scenes });
            }}
          />
        </div>
      ))}
    </div>
  );
}

function CarouselEditor({ script, onChange }: { script: Extract<Script, { format: "carrossel" }>; onChange: (s: Script) => void }) {
  return (
    <div className="space-y-2">
      {script.slides.map((slide, i) => (
        <label key={i} className="block text-xs text-ink/60">
          Slide {slide.index}
          <textarea
            className="mt-1 w-full rounded-card border border-sage/20 bg-white px-2 py-1.5 text-sm text-ink"
            rows={2}
            value={slide.text}
            onChange={(e) => {
              const slides = [...script.slides];
              slides[i] = { ...slide, text: e.target.value };
              onChange({ ...script, slides });
            }}
          />
        </label>
      ))}
    </div>
  );
}

function StoriesEditor({ script, onChange }: { script: Extract<Script, { format: "stories" }>; onChange: (s: Script) => void }) {
  return (
    <div className="space-y-2">
      {script.screens.map((screen, i) => (
        <div key={i} className="rounded-card border border-sage/20 bg-white p-2.5 space-y-1">
          <label className="block text-xs text-ink/60">
            Tela {screen.index}
            <textarea
              className="mt-1 w-full rounded-card border border-sage/20 px-2 py-1.5 text-sm text-ink"
              rows={2}
              value={screen.text}
              onChange={(e) => {
                const screens = [...script.screens];
                screens[i] = { ...screen, text: e.target.value };
                onChange({ ...script, screens });
              }}
            />
          </label>
          <input
            className="w-full rounded-pill border border-sage/20 px-2 py-1 text-xs"
            placeholder="Enquete ou caixa de pergunta"
            value={screen.interaction ?? ""}
            onChange={(e) => {
              const screens = [...script.screens];
              screens[i] = { ...screen, interaction: e.target.value };
              onChange({ ...script, screens });
            }}
          />
        </div>
      ))}
    </div>
  );
}

function StaticEditor({ script, onChange }: { script: Extract<Script, { format: "estatico" }>; onChange: (s: Script) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs text-ink/60">
        Texto da arte
        <textarea
          className="mt-1 w-full rounded-card border border-sage/20 bg-white px-2 py-1.5 text-sm"
          rows={3}
          value={script.content.artText}
          onChange={(e) => onChange({ ...script, content: { ...script.content, artText: e.target.value } })}
        />
      </label>
      <label className="block text-xs text-ink/60">
        Sugestão de foto
        <textarea
          className="mt-1 w-full rounded-card border border-sage/20 bg-white px-2 py-1.5 text-sm"
          rows={2}
          value={script.content.photoSuggestion}
          onChange={(e) =>
            onChange({ ...script, content: { ...script.content, photoSuggestion: e.target.value } })
          }
        />
      </label>
    </div>
  );
}

function WhatsappEditor({ script, onChange }: { script: Extract<Script, { format: "whatsapp" }>; onChange: (s: Script) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs text-ink/60">
        Mensagem
        <textarea
          className="mt-1 w-full rounded-card border border-sage/20 bg-white px-2 py-1.5 text-sm"
          rows={3}
          value={script.content.message}
          onChange={(e) => onChange({ ...script, content: { ...script.content, message: e.target.value } })}
        />
      </label>
      <label className="block text-xs text-ink/60">
        Texto do botão
        <input
          className="mt-1 w-full rounded-pill border border-sage/20 bg-white px-3 py-1.5 text-sm"
          value={script.content.button}
          onChange={(e) => onChange({ ...script, content: { ...script.content, button: e.target.value } })}
        />
      </label>
    </div>
  );
}

export function ScriptBlock({
  script,
  loading,
  error,
  disabled,
  onGenerate,
  onChange,
}: {
  script?: Script;
  loading: boolean;
  error?: string;
  disabled?: boolean;
  onGenerate: (refinement: Refinement) => void;
  onChange: (script: Script) => void;
}) {
  return (
    <section className="rounded-card bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-leaf">2. Roteiro</h3>
        <GenerationControls
          disabled={disabled}
          loading={loading}
          hasContent={Boolean(script)}
          onGenerate={() => onGenerate(null)}
          onRefine={onGenerate}
          onCopy={() => script && navigator.clipboard.writeText(scriptToText(script))}
        />
      </div>
      {error && <p className="text-xs text-magenta">{error}</p>}
      {disabled && !script && (
        <p className="text-xs text-ink/50">Gere a ideia primeiro.</p>
      )}
      {script?.format === "reels" && <ReelsEditor script={script} onChange={onChange} />}
      {script?.format === "carrossel" && <CarouselEditor script={script} onChange={onChange} />}
      {script?.format === "stories" && <StoriesEditor script={script} onChange={onChange} />}
      {script?.format === "estatico" && <StaticEditor script={script} onChange={onChange} />}
      {script?.format === "whatsapp" && <WhatsappEditor script={script} onChange={onChange} />}
    </section>
  );
}

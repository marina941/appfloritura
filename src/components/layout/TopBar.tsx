import { Logo } from "../common/Logo";
import { ExportMenu } from "../common/ExportMenu";

export type View = "planejamento" | "calendario" | "lista";

const TABS: { id: View; label: string }[] = [
  { id: "planejamento", label: "Planejamento" },
  { id: "calendario", label: "Calendário" },
  { id: "lista", label: "Lista" },
];

export function TopBar({
  view,
  onChangeView,
}: {
  view: View;
  onChangeView: (v: View) => void;
}) {
  return (
    <header className="sticky top-0 z-20 bg-sage">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2">
        <Logo />
        <div>
          <p className="text-sm font-semibold leading-tight text-white">A Floritura</p>
          <p className="text-[11px] leading-tight text-white/80">Planejamento de conteúdo</p>
        </div>
        <nav className="ml-auto flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChangeView(tab.id)}
              className={`rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors ${
                view === tab.id
                  ? "bg-white text-leaf"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <ExportMenu />
        </nav>
      </div>
    </header>
  );
}

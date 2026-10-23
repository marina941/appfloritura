import { useState } from "react";
import { Download } from "lucide-react";
import { usePlanStore } from "../../store/usePlanStore";
import { exportPostsToPdf } from "../../lib/exportPdf";
import { exportPostsToXlsx } from "../../lib/exportXlsx";

export function ExportMenu() {
  const posts = usePlanStore((s) => s.posts);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={posts.length === 0}
        className="flex items-center gap-1.5 rounded-pill bg-white px-3.5 py-1.5 text-sm font-medium text-leaf hover:bg-sage-light disabled:opacity-40"
      >
        <Download className="h-3.5 w-3.5" /> Exportar
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-card bg-white p-1.5 shadow-lg">
          <button
            className="block w-full rounded-card px-3 py-2 text-left text-sm text-ink hover:bg-sage-light"
            onClick={() => {
              exportPostsToPdf(posts, "Programação");
              setOpen(false);
            }}
          >
            Exportar em PDF
          </button>
          <button
            className="block w-full rounded-card px-3 py-2 text-left text-sm text-ink hover:bg-sage-light"
            onClick={() => {
              exportPostsToXlsx(posts, "Programação");
              setOpen(false);
            }}
          >
            Exportar em planilha
          </button>
        </div>
      )}
    </div>
  );
}

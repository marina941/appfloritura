import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Post } from "../types";
import { FORMAT_LABELS, OBJECTIVE_LABELS, STATUS_LABELS } from "./labels";
import { formatLongDate } from "./dateUtils";
import { scriptToText } from "./scriptFormat";

export function exportPostsToPdf(posts: Post[], title: string) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.setTextColor(63, 90, 58); // leaf
  doc.text(`A Floritura — ${title}`, 14, 16);

  const sorted = [...posts].sort((a, b) => a.date.localeCompare(b.date));

  autoTable(doc, {
    startY: 22,
    head: [["Data", "Objetivo", "Formato", "Status", "Ideia"]],
    body: sorted.map((p) => [
      formatLongDate(p.date),
      OBJECTIVE_LABELS[p.objective],
      FORMAT_LABELS[p.format],
      STATUS_LABELS[p.status],
      p.idea?.title ?? "—",
    ]),
    headStyles: { fillColor: [123, 139, 99] },
    styles: { fontSize: 9 },
  });

  let y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  for (const post of sorted) {
    if (!post.idea) continue;
    if (y > 260) {
      doc.addPage();
      y = 16;
    }
    doc.setFontSize(11);
    doc.setTextColor(63, 90, 58);
    doc.text(`${formatLongDate(post.date)} — ${post.idea.title}`, 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(74, 74, 74);
    const concept = doc.splitTextToSize(post.idea.concept, 180);
    doc.text(concept, 14, y);
    y += concept.length * 4.5 + 2;

    if (post.script) {
      const scriptLines = doc.splitTextToSize(scriptToText(post.script), 180);
      doc.text(scriptLines, 14, y);
      y += scriptLines.length * 4.5 + 2;
    }

    if (post.caption) {
      const captionLines = doc.splitTextToSize(`Legenda: ${post.caption}`, 180);
      doc.text(captionLines, 14, y);
      y += captionLines.length * 4.5 + 6;
    } else {
      y += 4;
    }
  }

  doc.save(`floritura-${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

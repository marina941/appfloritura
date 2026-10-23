import ExcelJS from "exceljs";
import type { Post } from "../types";
import { FORMAT_LABELS, OBJECTIVE_LABELS, STATUS_LABELS } from "./labels";
import { formatLongDate } from "./dateUtils";
import { scriptToText } from "./scriptFormat";

export async function exportPostsToXlsx(posts: Post[], title: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Programação");

  sheet.columns = [
    { header: "Data", key: "date", width: 16 },
    { header: "Objetivo", key: "objective", width: 20 },
    { header: "Formato", key: "format", width: 16 },
    { header: "Status", key: "status", width: 14 },
    { header: "Título da ideia", key: "title", width: 30 },
    { header: "Conceito", key: "concept", width: 40 },
    { header: "Roteiro", key: "script", width: 50 },
    { header: "Legenda", key: "caption", width: 50 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF7B8B63" },
  };

  const sorted = [...posts].sort((a, b) => a.date.localeCompare(b.date));
  for (const post of sorted) {
    sheet.addRow({
      date: formatLongDate(post.date),
      objective: OBJECTIVE_LABELS[post.objective],
      format: FORMAT_LABELS[post.format],
      status: STATUS_LABELS[post.status],
      title: post.idea?.title ?? "",
      concept: post.idea?.concept ?? "",
      script: post.script ? scriptToText(post.script) : "",
      caption: post.caption ?? "",
    });
  }

  sheet.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `floritura-${title.toLowerCase().replace(/\s+/g, "-")}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

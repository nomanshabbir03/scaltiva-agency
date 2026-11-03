const cell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

// Downloads rows as a CSV that opens straight in Excel. The BOM makes Excel
// read Urdu and other non-English text correctly.
export function downloadCsv(name: string, header: string[], rows: unknown[][]) {
  const lines = [header, ...rows].map((r) => r.map(cell).join(","));
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const fileName = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "export";

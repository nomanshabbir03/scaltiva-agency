import { downloadCsv } from "@/lib/csv";

export type NewQuestion = { question: string; options: string[]; correct_index: number };

// Minimal CSV reader: commas, quoted fields with "" escapes, and line breaks inside quotes.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * Columns: Question, Option A, Option B, [Option C … Option F], Correct.
 * Correct is a letter (A–F) or a number (1–6). A header row is skipped.
 */
export function parseQuestions(text: string): { questions: NewQuestion[]; errors: string[] } {
  const rows = parseCsv(text);
  if (rows[0]?.[0]?.trim().toLowerCase() === "question") rows.shift();
  const questions: NewQuestion[] = [];
  const errors: string[] = [];

  rows.forEach((cells, i) => {
    const line = i + 2;
    const trimmed = cells.map((c) => c.trim());
    const question = trimmed[0];
    const correctRaw = trimmed[trimmed.length - 1].toUpperCase();
    const options = trimmed.slice(1, -1).filter(Boolean);
    const letter = LETTERS.indexOf(correctRaw);
    const correct = letter >= 0 ? letter + 1 : Number(correctRaw);

    if (!question) return errors.push(`Row ${line}: the question is empty.`);
    if (options.length < 2 || options.length > 6) return errors.push(`Row ${line}: needs 2 to 6 options (found ${options.length}).`);
    if (!Number.isInteger(correct) || correct < 1 || correct > options.length)
      return errors.push(`Row ${line}: the correct answer "${correctRaw}" isn't one of the options (use A–${LETTERS[options.length - 1]}).`);
    questions.push({ question, options, correct_index: correct });
  });

  return { questions, errors };
}

export function downloadQuizTemplate() {
  downloadCsv(
    "quiz-template",
    ["Question", "Option A", "Option B", "Option C", "Option D", "Correct"],
    [
      ["What does HTML stand for?", "Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks Text Mark Language", "A"],
      ["Which tag makes a link?", "<link>", "<a>", "<href>", "<url>", "B"],
      ["Is CSS used for styling?", "Yes", "No", "", "", "A"],
    ],
  );
}

export const optionLetter = (index: number) => LETTERS[index - 1] ?? String(index);

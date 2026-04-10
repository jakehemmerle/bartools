import path from "node:path";
import { PATHS } from "./types";

const REPO_ROOT = path.resolve(import.meta.dir, "../../..");

function parseCsvRows(text: string): string[][] {
  const stripped = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];
    if (inQuotes) {
      if (ch === '"') {
        if (stripped[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (ch === "\r") continue;
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
      continue;
    }
    field += ch;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseCsvNames(text: string): string[] {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return [];
  // Skip header row.
  const seen = new Set<string>();
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && row[0] === "") continue; // blank row
    const name = (row[1] ?? "").trim();
    if (name.length === 0) continue;
    seen.add(name);
  }
  return [...seen].sort();
}

let cached: Promise<string[]> | null = null;

export function loadBottleNames(): Promise<string[]> {
  if (!cached) {
    const abs = path.resolve(REPO_ROOT, PATHS.csv);
    cached = Bun.file(abs)
      .text()
      .then(parseCsvNames);
  }
  return cached;
}

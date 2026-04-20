import path from "node:path";

const CATALOG_CSV_PATH = path.resolve(import.meta.dir, "../assets/verbena_simple.csv");

export function parseCsvRows(text: string): string[][] {
  const stripped = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];
    if (inQuotes) {
      if (ch === "\"") {
        if (stripped[i + 1] === "\"") {
          field += "\"";
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === "\"") {
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

export function parseCatalogBottleNames(text: string): string[] {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return [];

  const seen = new Set<string>();
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (row?.length === 1 && row[0] === "") continue;
    const name = (row?.[1] ?? "").trim();
    if (name) {
      seen.add(name);
    }
  }

  return [...seen].sort();
}

let catalogNamesPromise: Promise<string[]> | null = null;

export function loadCatalogBottleNames(): Promise<string[]> {
  if (!catalogNamesPromise) {
    catalogNamesPromise = Bun.file(CATALOG_CSV_PATH).text().then(parseCatalogBottleNames);
  }
  return catalogNamesPromise;
}

export function buildCatalogUserPrompt(bottleNames: readonly string[]): string {
  return [
    "Identify the bottle in this photo.",
    "",
    `Choose the closest match from this list of ${bottleNames.length} bottle names; copy the name VERBATIM:`,
    "",
    bottleNames.join("\n"),
    "",
    "Then estimate fill level from 0.0 to 1.0 in 0.1 steps.",
    "Call submit_answer({{ name, volume }}) exactly once with your answer.",
  ].join("\n");
}

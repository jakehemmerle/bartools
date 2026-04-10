import type { Solution } from "./types";

export async function loadSolutions(absolutePath: string): Promise<Map<string, Solution>> {
  const file = Bun.file(absolutePath);
  if (!(await file.exists())) return new Map();

  const text = await file.text();
  const map = new Map<string, Solution>();
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().length === 0) continue;
    let parsed: Solution;
    try {
      parsed = JSON.parse(line) as Solution;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse solutions at ${absolutePath} line ${i + 1}: ${reason}`);
    }
    map.set(parsed.file, parsed);
  }
  return map;
}

export async function writeSolutions(absolutePath: string, rows: Solution[]): Promise<void> {
  const sorted = [...rows].sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0));
  const body = sorted.map((row) => JSON.stringify(row)).join("\n") + "\n";
  await Bun.write(absolutePath, body);
}

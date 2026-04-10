import { describe, test, expect, afterEach } from "bun:test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink } from "node:fs/promises";
import { loadSolutions, writeSolutions } from "./solutions";
import type { Solution } from "./types";

const created: string[] = [];

function tmpPath(): string {
  const p = join(tmpdir(), `solutions-${crypto.randomUUID()}.jsonl`);
  created.push(p);
  return p;
}

afterEach(async () => {
  while (created.length) {
    const p = created.pop()!;
    try {
      await unlink(p);
    } catch {}
  }
});

describe("loadSolutions", () => {
  test("returns empty Map on non-existent path", async () => {
    const result = await loadSolutions(tmpPath());
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  test("skips blank lines", async () => {
    const p = tmpPath();
    const body =
      '{"file":"a.jpg","name":"Aperol","volume":0.5}\n\n{"file":"b.jpg","name":"","volume":0}\n   \n';
    await Bun.write(p, body);
    const result = await loadSolutions(p);
    expect(result.size).toBe(2);
    expect(result.get("a.jpg")).toEqual({ file: "a.jpg", name: "Aperol", volume: 0.5 });
    expect(result.get("b.jpg")).toEqual({ file: "b.jpg", name: "", volume: 0 });
  });

  test("throws Error with 1-indexed line number on malformed JSON", async () => {
    const p = tmpPath();
    const body =
      '{"file":"a.jpg","name":"Aperol","volume":0.5}\nNOT_JSON\n{"file":"c.jpg","name":"","volume":0}\n';
    await Bun.write(p, body);
    await expect(loadSolutions(p)).rejects.toThrow(/line 2/);
  });
});

describe("writeSolutions", () => {
  test("round-trip: write 3 rows → read back", async () => {
    const p = tmpPath();
    const rows: Solution[] = [
      { file: "b.jpg", name: "Campari", volume: 0.3 },
      { file: "a.jpg", name: "Aperol", volume: 0.5 },
      { file: "c.jpg", name: "", volume: 0 },
    ];
    await writeSolutions(p, rows);
    const result = await loadSolutions(p);
    expect(result.size).toBe(3);
    for (const row of rows) {
      expect(result.get(row.file)).toEqual(row);
    }
  });

  test("writes rows sorted by file", async () => {
    const p = tmpPath();
    const rows: Solution[] = [
      { file: "c.jpg", name: "C", volume: 0 },
      { file: "a.jpg", name: "A", volume: 0 },
      { file: "b.jpg", name: "B", volume: 0 },
    ];
    await writeSolutions(p, rows);
    const text = await Bun.file(p).text();
    const lines = text.trimEnd().split("\n");
    expect(lines.map((l) => JSON.parse(l).file)).toEqual(["a.jpg", "b.jpg", "c.jpg"]);
  });

  test("ends with a single trailing newline", async () => {
    const p = tmpPath();
    const rows: Solution[] = [{ file: "a.jpg", name: "A", volume: 0 }];
    await writeSolutions(p, rows);
    const text = await Bun.file(p).text();
    expect(text.endsWith("\n")).toBe(true);
    expect(text.endsWith("\n\n")).toBe(false);
  });
});

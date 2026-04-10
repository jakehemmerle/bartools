import { describe, test, expect, afterEach } from "bun:test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdir, rm } from "node:fs/promises";
import { seed } from "./seed";
import { loadSolutions, writeSolutions } from "./solutions";
import type { Solution } from "./types";

const workspaces: string[] = [];

async function makeWorkspace(): Promise<{ photosDir: string; solutionsPath: string }> {
  const root = join(tmpdir(), `seed-${crypto.randomUUID()}`);
  const photosDir = join(root, "photos");
  const solutionsPath = join(root, "solutions.jsonl");
  await mkdir(photosDir, { recursive: true });
  workspaces.push(root);
  return { photosDir, solutionsPath };
}

async function touch(path: string): Promise<void> {
  await Bun.write(path, "");
}

afterEach(async () => {
  while (workspaces.length) {
    const p = workspaces.pop()!;
    try {
      await rm(p, { recursive: true, force: true });
    } catch {}
  }
});

describe("seed", () => {
  test("empty existing file + 3 fake photos → adds 3", async () => {
    const ws = await makeWorkspace();
    await touch(join(ws.photosDir, "IMG_1.jpg"));
    await touch(join(ws.photosDir, "IMG_2.jpg"));
    await touch(join(ws.photosDir, "IMG_3.jpg"));

    const result = await seed(ws);
    expect(result).toEqual({ added: 3, preserved: 0 });

    const rows = await loadSolutions(ws.solutionsPath);
    expect(rows.size).toBe(3);
    for (const file of ["IMG_1.jpg", "IMG_2.jpg", "IMG_3.jpg"]) {
      expect(rows.get(file)).toEqual({ file, name: "", volume: 0 });
    }

    const text = await Bun.file(ws.solutionsPath).text();
    const files = text
      .trimEnd()
      .split("\n")
      .map((l) => JSON.parse(l).file);
    expect(files).toEqual(["IMG_1.jpg", "IMG_2.jpg", "IMG_3.jpg"]);
  });

  test("existing labeled row + new photo → preserves label, adds new", async () => {
    const ws = await makeWorkspace();
    const existing: Solution = { file: "IMG_1.jpg", name: "Aperol", volume: 0.5 };
    await writeSolutions(ws.solutionsPath, [existing]);
    await touch(join(ws.photosDir, "IMG_1.jpg"));
    await touch(join(ws.photosDir, "IMG_2.jpg"));

    const result = await seed(ws);
    expect(result).toEqual({ added: 1, preserved: 1 });

    const rows = await loadSolutions(ws.solutionsPath);
    expect(rows.get("IMG_1.jpg")).toEqual(existing);
    expect(rows.get("IMG_2.jpg")).toEqual({ file: "IMG_2.jpg", name: "", volume: 0 });
  });

  test('existing row with name "" is preserved as-is (not reset)', async () => {
    const ws = await makeWorkspace();
    const existing: Solution = { file: "IMG_1.jpg", name: "", volume: 0.7 };
    await writeSolutions(ws.solutionsPath, [existing]);
    await touch(join(ws.photosDir, "IMG_1.jpg"));

    const result = await seed(ws);
    expect(result).toEqual({ added: 0, preserved: 1 });

    const rows = await loadSolutions(ws.solutionsPath);
    expect(rows.get("IMG_1.jpg")).toEqual(existing);
  });

  test("re-running is idempotent", async () => {
    const ws = await makeWorkspace();
    await touch(join(ws.photosDir, "IMG_1.jpg"));
    await touch(join(ws.photosDir, "IMG_2.jpg"));

    const first = await seed(ws);
    expect(first).toEqual({ added: 2, preserved: 0 });

    const second = await seed(ws);
    expect(second).toEqual({ added: 0, preserved: 2 });
  });

  test("existing rows for photos that no longer exist are kept", async () => {
    const ws = await makeWorkspace();
    const ghost: Solution = { file: "GHOST.jpg", name: "Chartreuse", volume: 0.2 };
    await writeSolutions(ws.solutionsPath, [ghost]);
    await touch(join(ws.photosDir, "IMG_1.jpg"));

    const result = await seed(ws);
    expect(result).toEqual({ added: 1, preserved: 1 });

    const rows = await loadSolutions(ws.solutionsPath);
    expect(rows.get("GHOST.jpg")).toEqual(ghost);
    expect(rows.get("IMG_1.jpg")).toEqual({ file: "IMG_1.jpg", name: "", volume: 0 });
  });
});

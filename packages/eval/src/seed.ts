import path from "node:path";
import { PATHS, type Solution } from "./types";
import { loadSolutions, writeSolutions } from "./solutions";

const REPO_ROOT = path.resolve(import.meta.dir, "../../..");

export async function seed(opts: {
  photosDir: string;
  solutionsPath: string;
}): Promise<{ added: number; preserved: number }> {
  const glob = new Bun.Glob("*.jpg");
  const photoFiles: string[] = [];
  for await (const entry of glob.scan({ cwd: opts.photosDir, onlyFiles: true })) {
    photoFiles.push(entry);
  }

  const existing = await loadSolutions(opts.solutionsPath);
  const preserved = existing.size;
  let added = 0;

  // Start from existing rows — we keep labels for photos that no longer
  // exist on disk so users can track history without losing prior work.
  const merged = new Map<string, Solution>(existing);
  for (const file of photoFiles) {
    if (merged.has(file)) continue;
    merged.set(file, { file, name: "", volume: 0 });
    added++;
  }

  await writeSolutions(opts.solutionsPath, [...merged.values()]);
  return { added, preserved };
}

async function main(): Promise<void> {
  const photosDir = path.resolve(REPO_ROOT, PATHS.photosDir);
  const solutionsPath = path.resolve(REPO_ROOT, PATHS.solutions);
  const { added, preserved } = await seed({ photosDir, solutionsPath });
  console.log(`+${added} added, ${preserved} preserved`);
}

if (import.meta.main) {
  await main();
}

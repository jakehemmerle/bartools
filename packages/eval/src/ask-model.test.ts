import { describe, test, expect } from "bun:test";
import path from "node:path";
import { askModel, validateAnswer } from "./ask-model";
import { VOLUME_ENUM, PATHS } from "./types";

describe("validateAnswer", () => {
  const validNames = new Set(["Aperol", "Campari", "Angostura Bitters"]);

  test("valid name + valid volume 0 returns ok", () => {
    expect(validateAnswer("Aperol", 0, validNames)).toEqual({
      ok: true,
      volume: 0,
    });
  });

  test("valid name + valid volume 1.0 returns ok", () => {
    expect(validateAnswer("Campari", 1.0, validNames)).toEqual({
      ok: true,
      volume: 1.0,
    });
  });

  test("valid name + assorted valid volumes from VOLUME_ENUM return ok", () => {
    for (const v of VOLUME_ENUM) {
      expect(validateAnswer("Aperol", v, validNames)).toEqual({
        ok: true,
        volume: v,
      });
    }
  });

  test("valid name + 0.3 returns ok (literal from enum)", () => {
    expect(validateAnswer("Aperol", 0.3, validNames)).toEqual({
      ok: true,
      volume: 0.3,
    });
  });

  test("name with embedded spaces matches verbatim", () => {
    expect(validateAnswer("Angostura Bitters", 0.5, validNames)).toEqual({
      ok: true,
      volume: 0.5,
    });
  });

  test("invalid name returns invalid_name", () => {
    expect(validateAnswer("Aperrol", 0.5, validNames)).toEqual({
      ok: false,
      reason: "invalid_name",
    });
  });

  test("invalid name with case mismatch returns invalid_name", () => {
    expect(validateAnswer("aperol", 0.5, validNames)).toEqual({
      ok: false,
      reason: "invalid_name",
    });
  });

  test("empty string name returns invalid_name", () => {
    expect(validateAnswer("", 0.5, validNames)).toEqual({
      ok: false,
      reason: "invalid_name",
    });
  });

  test("valid name + 0.05 returns invalid_volume", () => {
    expect(validateAnswer("Aperol", 0.05, validNames)).toEqual({
      ok: false,
      reason: "invalid_volume",
    });
  });

  test("valid name + 0.55 returns invalid_volume", () => {
    expect(validateAnswer("Aperol", 0.55, validNames)).toEqual({
      ok: false,
      reason: "invalid_volume",
    });
  });

  test("valid name + 1.5 returns invalid_volume", () => {
    expect(validateAnswer("Aperol", 1.5, validNames)).toEqual({
      ok: false,
      reason: "invalid_volume",
    });
  });

  test("valid name + -0.1 returns invalid_volume", () => {
    expect(validateAnswer("Aperol", -0.1, validNames)).toEqual({
      ok: false,
      reason: "invalid_volume",
    });
  });

  test("valid name + NaN returns invalid_volume", () => {
    expect(validateAnswer("Aperol", Number.NaN, validNames)).toEqual({
      ok: false,
      reason: "invalid_volume",
    });
  });

  test("valid name + Infinity returns invalid_volume", () => {
    expect(validateAnswer("Aperol", Number.POSITIVE_INFINITY, validNames)).toEqual({
      ok: false,
      reason: "invalid_volume",
    });
  });

  test("empty validNames set fails every name with invalid_name", () => {
    const empty = new Set<string>();
    expect(validateAnswer("Aperol", 0.5, empty)).toEqual({
      ok: false,
      reason: "invalid_name",
    });
    expect(validateAnswer("", 0, empty)).toEqual({
      ok: false,
      reason: "invalid_name",
    });
  });

  test("invalid name is reported even when volume is also invalid", () => {
    expect(validateAnswer("Unknown", 0.55, validNames)).toEqual({
      ok: false,
      reason: "invalid_name",
    });
  });

  test("0.1 + 0.2 float drift normalizes to canonical 0.3", () => {
    // Sanity: JS arithmetic drift exists.
    expect(0.1 + 0.2 === 0.3).toBe(false);
    // But validateAnswer normalizes via Math.round, so the lookup is robust.
    expect(validateAnswer("Aperol", 0.1 + 0.2, validNames)).toEqual({
      ok: true,
      volume: 0.3,
    });
  });

  test("returned volume is the canonical grid value", () => {
    const result = validateAnswer("Aperol", 0.1 + 0.2, validNames);
    if (!result.ok) throw new Error("expected ok");
    expect(result.volume).toBe(0.3);
  });
});

const integrationTest = process.env.CLAUDE_CODE_OAUTH_TOKEN ? test : test.skip;

describe("askModel (integration)", () => {
  integrationTest(
    "calls the agent for the first photo and returns a Prediction",
    async () => {
      const photosDir = path.resolve(
        import.meta.dir,
        "../../../",
        PATHS.photosDir,
      );
      const glob = new Bun.Glob("*.jpg");
      const files: string[] = [];
      for await (const f of glob.scan({ cwd: photosDir })) {
        files.push(f);
      }
      files.sort();
      const file = files[0];
      if (!file) throw new Error(`no photos in ${photosDir}`);

      const bottleNames = ["Aperol", "Angostura Bitters"];
      const result = await askModel({ file, bottleNames });

      expect(result.file).toBe(file);
      expect(typeof result.volume).toBe("number");
      if (!result.error) {
        expect(bottleNames).toContain(result.name);
      }
    },
    60_000,
  );
});

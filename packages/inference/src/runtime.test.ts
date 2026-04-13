import { describe, expect, test } from "bun:test";

import { validateAnswer } from "./runtime";
import { VOLUME_ENUM } from "./types";

describe("validateAnswer", () => {
  const validNames = new Set(["Aperol", "Campari", "Angostura Bitters"]);

  test("accepts every canonical volume step", () => {
    for (const v of VOLUME_ENUM) {
      expect(validateAnswer("Aperol", v, validNames)).toEqual({
        ok: true,
        volume: v,
      });
    }
  });

  test("rejects names outside the shared catalog", () => {
    expect(validateAnswer("aperol", 0.5, validNames)).toEqual({
      ok: false,
      reason: "invalid_name",
    });
  });

  test("rejects off-grid fill levels", () => {
    expect(validateAnswer("Aperol", 0.55, validNames)).toEqual({
      ok: false,
      reason: "invalid_volume",
    });
  });

  test("normalizes floating point drift to the canonical grid", () => {
    expect(validateAnswer("Aperol", 0.1 + 0.2, validNames)).toEqual({
      ok: true,
      volume: 0.3,
    });
  });
});

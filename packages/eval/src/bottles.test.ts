import { describe, test, expect } from "bun:test";
import { parseCsvNames, loadBottleNames } from "./bottles";

describe("parseCsvNames", () => {
  test("parses Size,Name,Type header and returns column-2 values", () => {
    const csv = "Size,Name,Type\n,Aperol,liqueur\n,Campari,liqueur\n";
    expect(parseCsvNames(csv)).toEqual(["Aperol", "Campari"]);
  });

  test("dedupes repeated names", () => {
    const csv = "Size,Name,Type\n,Aperol,liqueur\n,Aperol,liqueur\n,Campari,liqueur\n";
    expect(parseCsvNames(csv)).toEqual(["Aperol", "Campari"]);
  });

  test("sorts ascii", () => {
    const csv = "Size,Name,Type\n,Zucca,amaro\n,Aperol,liqueur\n,Campari,liqueur\n";
    expect(parseCsvNames(csv)).toEqual(["Aperol", "Campari", "Zucca"]);
  });

  test("trims whitespace from names", () => {
    const csv = "Size,Name,Type\n,  Aperol  ,liqueur\n,Campari ,liqueur\n";
    expect(parseCsvNames(csv)).toEqual(["Aperol", "Campari"]);
  });

  test("handles quoted field with embedded commas", () => {
    const csv = 'Size,Name,Type\n,"Knob Creek 9, Small Batch",bourbon\n';
    expect(parseCsvNames(csv)).toContain("Knob Creek 9, Small Batch");
  });

  test('handles ""-escaped quote inside a field', () => {
    const csv = 'Size,Name,Type\n,"Still Austin ""The Musician"" Bourbon",bourbon\n';
    expect(parseCsvNames(csv)).toContain('Still Austin "The Musician" Bourbon');
  });

  test("handles leading BOM", () => {
    const csv = "\uFEFFSize,Name,Type\n,Aperol,liqueur\n";
    expect(parseCsvNames(csv)).toEqual(["Aperol"]);
  });

  test("skips blank rows", () => {
    const csv = "Size,Name,Type\n\n,Aperol,liqueur\n\n,Campari,liqueur\n\n";
    expect(parseCsvNames(csv)).toEqual(["Aperol", "Campari"]);
  });

  test("skips rows with an empty Name column", () => {
    const csv = "Size,Name,Type\n,,liqueur\n,Aperol,liqueur\n, ,liqueur\n";
    expect(parseCsvNames(csv)).toEqual(["Aperol"]);
  });
});

describe("loadBottleNames", () => {
  test("returns non-empty, trimmed, unique, sorted names from the real CSV", async () => {
    const names = await loadBottleNames();
    expect(names.length).toBeGreaterThan(0);
    for (const n of names) {
      expect(typeof n).toBe("string");
      expect(n.length).toBeGreaterThan(0);
      expect(n).toBe(n.trim());
    }
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual([...names].sort());
  });
});

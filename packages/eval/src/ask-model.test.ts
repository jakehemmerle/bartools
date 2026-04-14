import { describe, expect, test } from "bun:test";

import { askModel } from "./ask-model";

describe("askModel", () => {
  test("returns a tagged error when the dataset attachment is missing", async () => {
    const result = await askModel({ file: "missing.jpg" });
    expect(result).toEqual({
      file: "missing.jpg",
      name: "",
      volume: 0,
      error: "missing bottle_photo attachment",
    });
  });
});

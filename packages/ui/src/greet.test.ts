import { expect, test, describe } from "bun:test";
import { greet } from "./greet";

describe("greet", () => {
  test("says hello to a name", () => {
    expect(greet("world")).toBe("Hello, world!");
  });

  test("says hello to bartools", () => {
    expect(greet("bartools")).toBe("Hello, bartools!");
  });
});

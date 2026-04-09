import { expect, test } from "bun:test";
import { greet } from "./greet";

test("greets a name", () => {
  expect(greet("world")).toBe("Hello, world!");
});

import { describe, expect, test } from "bun:test";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

import {
  buildDefaultPromptTemplate,
  promptValueToModelInput,
  renderPromptTemplate,
} from "./prompt";

describe("prompt template", () => {
  test("default template renders a fully materialized catalog prompt", async () => {
    const rendered = await renderPromptTemplate(await buildDefaultPromptTemplate());
    expect(rendered.systemPrompt).toContain("submit_answer");
    expect(rendered.userPrompt).toContain("bottle names");
    expect(rendered.userPrompt).toContain("Aperol");
    expect(rendered.userPrompt).toContain("Campari");
    expect(rendered.userPrompt).not.toContain("{bottle_count}");
  });

  test("promptValueToModelInput rejects unsupported message types", () => {
    expect(() =>
      promptValueToModelInput({
        toChatMessages() {
          return [new SystemMessage("sys"), new AIMessage("assistant")];
        },
      }),
    ).toThrow("unsupported prompt message type");
  });

  test("promptValueToModelInput requires one system and one human message", () => {
    expect(() =>
      promptValueToModelInput({
        toChatMessages() {
          return [new HumanMessage("user only")];
        },
      }),
    ).toThrow("prompt must render one system and one human message");
  });
});

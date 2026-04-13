import { describe, expect, test } from "bun:test";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

import {
  buildDefaultPromptTemplate,
  promptValueToModelInput,
  renderPromptTemplate,
} from "./prompt";

describe("prompt template", () => {
  test("default template renders expected system and user prompt", async () => {
    const rendered = await renderPromptTemplate(buildDefaultPromptTemplate(), [
      "Aperol",
      "Campari",
    ]);
    expect(rendered.systemPrompt).toContain("submit_answer");
    expect(rendered.userPrompt).toContain("2 bottle names");
    expect(rendered.userPrompt).toContain("Aperol\nCampari");
    expect(rendered.userPrompt).not.toContain("{bottle_count}");
    expect(rendered.userPrompt).not.toContain("{possible_bottle_names_text}");
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

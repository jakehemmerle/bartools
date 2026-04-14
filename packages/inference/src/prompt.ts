import type { BaseMessageLike } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub/node";

import { loadCatalogBottleNames, buildCatalogUserPrompt } from "./catalog";
import { client } from "./client";

export const PROMPT_NAME = "verbena-simple-eval";

export const DEFAULT_SYSTEM_PROMPT =
  "You are a bar-inventory vision model. Given a single photo of a bottle, identify which product it is from the provided list of bottle names and estimate how full the bottle is, on a scale from 0.0 (empty) to 1.0 (full), in 0.1 increments. You have exactly one tool: submit_answer. Call it exactly once with your final answer. The name MUST be copied verbatim from the list; do not paraphrase, normalize capitalization, or add commentary. After submit_answer succeeds, end the conversation.";

export type RenderedPrompt = {
  systemPrompt: string;
  userPrompt: string;
};

type ChatPromptValueLike = {
  toChatMessages(): Array<{
    text: unknown;
    getType?: () => string;
    _getType?: () => string;
    constructor?: { name?: string };
  }>;
};

export async function buildDefaultPromptTemplate(): Promise<ChatPromptTemplate> {
  const bottleNames = await loadCatalogBottleNames();
  return ChatPromptTemplate.fromMessages([
    ["system", DEFAULT_SYSTEM_PROMPT],
    ["human", buildCatalogUserPrompt(bottleNames)],
  ] satisfies BaseMessageLike[]);
}

function getMessageType(message: {
  getType?: () => string;
  _getType?: () => string;
  constructor?: { name?: string };
}): string {
  if (typeof message.getType === "function") return message.getType();
  if (typeof message._getType === "function") return message._getType();
  const ctor = message.constructor?.name?.toLowerCase() ?? "";
  if (ctor.includes("system")) return "system";
  if (ctor.includes("human")) return "human";
  return "unknown";
}

export function promptValueToModelInput(
  promptValue: ChatPromptValueLike,
): RenderedPrompt {
  const messages = promptValue.toChatMessages();
  let systemPrompt = "";
  let userPrompt = "";

  for (const message of messages) {
    const content = message.text;
    if (typeof content !== "string") {
      throw new Error("prompt must render to plain string message content");
    }
    const type = getMessageType(message);
    if (type === "system") {
      if (systemPrompt) {
        throw new Error("prompt must render exactly one system message");
      }
      systemPrompt = content;
      continue;
    }
    if (type === "human") {
      if (userPrompt) {
        throw new Error("prompt must render exactly one human message");
      }
      userPrompt = content;
      continue;
    }
    throw new Error(`unsupported prompt message type: ${type}`);
  }

  if (!systemPrompt || !userPrompt) {
    throw new Error("prompt must render one system and one human message");
  }
  return { systemPrompt, userPrompt };
}

export async function renderPromptTemplate(
  prompt: Pick<ChatPromptTemplate, "invoke">,
  variables: Record<string, unknown> = {},
): Promise<RenderedPrompt> {
  return promptValueToModelInput(await prompt.invoke(variables));
}

function isMissingPromptCommitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /commit not found/i.test(message);
}

export async function pullPromptTemplate(args: {
  promptName: string;
  promptTag?: string;
  skipCache: boolean;
}): Promise<ChatPromptTemplate> {
  const promptRef = args.promptTag
    ? `${args.promptName}:${args.promptTag}`
    : args.promptName;
  try {
    return await pull<ChatPromptTemplate>(promptRef, {
      client,
      skipCache: args.skipCache,
    });
  } catch (error) {
    if (isMissingPromptCommitError(error)) {
      if (args.promptTag) {
        throw new Error(
          `LangSmith prompt ${promptRef} has no committed prompt object. Create or tag a real prompt object in LangSmith first.`,
        );
      }
      throw new Error(
        `LangSmith prompt ${promptRef} has no committed prompt object. Run \`bun run prompt:migrate\` once or create the prompt in LangSmith.`,
      );
    }
    throw error;
  }
}

export async function pushDefaultPromptTemplate(
  promptName: string,
): Promise<string> {
  await client.pushPrompt(promptName, {
    object: await buildDefaultPromptTemplate(),
    description:
      "Verbena Simple bottle-identification eval prompt as a LangChain ChatPromptTemplate.",
    commitDescription:
      "Publish the default Verbena Simple eval prompt as a LangChain prompt object.",
  });
  return (await client.pullPromptCommit(promptName, { skipCache: true })).commit_hash;
}

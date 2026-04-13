import {
  createSdkMcpServer,
  query,
  tool,
  type SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

import { loadCatalogBottleNames } from "./catalog";
import { DEFAULT_MODEL, MAX_ATTEMPTS, VOLUME_ENUM } from "./types";

const VALID_VOLUMES: ReadonlySet<number> = new Set<number>(VOLUME_ENUM);
const VOLUME_GRID_EPSILON = 1e-9;

export function validateAnswer(
  name: string,
  volume: number,
  validNames: Set<string>,
):
  | { ok: true; volume: number }
  | { ok: false; reason: "invalid_name" | "invalid_volume" } {
  if (!validNames.has(name)) {
    return { ok: false, reason: "invalid_name" };
  }
  if (!Number.isFinite(volume)) {
    return { ok: false, reason: "invalid_volume" };
  }
  const normalized = Math.round(volume * 10) / 10;
  if (Math.abs(volume - normalized) > VOLUME_GRID_EPSILON) {
    return { ok: false, reason: "invalid_volume" };
  }
  if (!VALID_VOLUMES.has(normalized)) {
    return { ok: false, reason: "invalid_volume" };
  }
  return { ok: true, volume: normalized };
}

async function* asyncIter<T>(items: T[]): AsyncIterable<T> {
  for (const item of items) yield item;
}

export type InferenceResult = {
  name: string;
  volume: number;
  error?: string;
};

export async function runBottleInference(input: {
  imageBytes: Uint8Array;
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  validNames?: readonly string[];
}): Promise<InferenceResult> {
  const base64 = Buffer.from(input.imageBytes).toString("base64");
  const validNames = new Set(input.validNames ?? (await loadCatalogBottleNames()));
  let attempts = 0;
  let answer: InferenceResult | null = null;
  const triedInvalid: string[] = [];

  const submitAnswer = tool(
    "submit_answer",
    "Submit your final bottle identification and fill-level estimate.",
    {
      name: z
        .string()
        .describe("Bottle name, copied verbatim from the provided list."),
      volume: z
        .number()
        .describe("Fill level from 0.0 to 1.0 in 0.1 increments."),
    },
    async (args) => {
      attempts += 1;
      const result = validateAnswer(args.name, args.volume, validNames);

      if (result.ok) {
        answer = {
          name: args.name,
          volume: result.volume,
        };
        return {
          content: [
            { type: "text", text: "Answer recorded. End the conversation." },
          ],
        };
      }

      if (result.reason === "invalid_name") {
        triedInvalid.push(args.name);
        if (attempts >= MAX_ATTEMPTS) {
          return {
            content: [
              { type: "text", text: "MAX_ATTEMPTS_EXCEEDED. Stop now." },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `"${args.name}" is not in the valid bottle list. Pick a different name verbatim from the list.`,
            },
          ],
          isError: true,
        };
      }

      if (attempts >= MAX_ATTEMPTS) {
        return {
          content: [{ type: "text", text: "MAX_ATTEMPTS_EXCEEDED. Stop now." }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `volume=${args.volume} is invalid. Use one of 0, 0.1, ..., 1.0.`,
          },
        ],
        isError: true,
      };
    },
  );

  const mcpServer = createSdkMcpServer({
    name: "eval",
    version: "0.1.0",
    tools: [submitAnswer],
  });

  const userMessage: SDKUserMessage = {
    type: "user",
    parent_tool_use_id: null,
    message: {
      role: "user",
      content: [
        { type: "text", text: input.userPrompt },
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: base64,
          },
        },
      ],
    },
  };

  const q = query({
    prompt: asyncIter([userMessage]),
    options: {
      systemPrompt: input.systemPrompt,
      model: input.model ?? DEFAULT_MODEL,
      tools: [],
      mcpServers: { eval: mcpServer },
      allowedTools: ["mcp__eval__submit_answer"],
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      persistSession: false,
    },
  });

  for await (const event of q) {
    void event;
  }

  if (answer) {
    return answer;
  }

  return {
    name: "",
    volume: 0,
    error: `agent never produced a valid answer; tried [${triedInvalid.join(", ")}]`,
  };
}

import {
  createSdkMcpServer,
  query,
  tool,
  type SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";
import { traceable } from "langsmith/traceable";
import { z } from "zod";

import { loadCatalogBottleNames } from "./catalog";
import { client } from "./client";
import { DEFAULT_MODEL, MAX_ATTEMPTS, VOLUME_ENUM } from "./types";

const VALID_VOLUMES: ReadonlySet<number> = new Set<number>(VOLUME_ENUM);
const VOLUME_GRID_EPSILON = 1e-9;
const SDK_STDERR_MAX_CHARS = 4000;

function appendDiagnosticTail(current: string, chunk: string): string {
  const next = current + chunk;
  return next.length > SDK_STDERR_MAX_CHARS
    ? next.slice(next.length - SDK_STDERR_MAX_CHARS)
    : next;
}

function redactDiagnostic(value: string): string {
  return value
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]");
}

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

type RunBottleInferenceInput = {
  imageBytes: Uint8Array;
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  validNames?: readonly string[];
};

async function runBottleInferenceImpl(
  input: RunBottleInferenceInput,
): Promise<InferenceResult> {
  const base64 = Buffer.from(input.imageBytes).toString("base64");
  const validNames = new Set(input.validNames ?? (await loadCatalogBottleNames()));
  let attempts = 0;
  let answer: InferenceResult | null = null;
  let stderrTail = "";
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

  try {
    const q = query({
      prompt: asyncIter([userMessage]),
      options: {
        systemPrompt: input.systemPrompt,
        model: input.model ?? DEFAULT_MODEL,
        tools: [],
        mcpServers: { eval: mcpServer },
        allowedTools: ["mcp__eval__submit_answer"],
        permissionMode: "dontAsk",
        persistSession: false,
        env: {
          CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR ?? "/tmp/.claude",
          HOME: process.env.HOME ?? "/tmp",
        },
        stderr: (data) => {
          stderrTail = appendDiagnosticTail(stderrTail, data);
        },
      },
    });

    for await (const event of q) {
      void event;
    }
  } catch (error) {
    if (answer) {
      return answer;
    }

    const message = error instanceof Error ? error.message : String(error);
    const diagnostic = redactDiagnostic(stderrTail).trim();
    return {
      name: "",
      volume: 0,
      error: diagnostic ? `${message}: ${diagnostic}` : message,
    };
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

export const runBottleInference = traceable(runBottleInferenceImpl, {
  name: "runBottleInference",
  run_type: "chain",
  client,
  processInputs: (input: Readonly<RunBottleInferenceInput>) => ({
    systemPrompt: input.systemPrompt,
    userPrompt: input.userPrompt,
    model: input.model ?? DEFAULT_MODEL,
    imageBytes: `<${input.imageBytes.length} bytes>`,
    validNamesCount: input.validNames?.length,
  }),
});

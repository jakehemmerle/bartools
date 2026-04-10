import path from "node:path";
import {
  createSdkMcpServer,
  query,
  tool,
  type SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import {
  DEFAULT_MODEL,
  MAX_ATTEMPTS,
  PATHS,
  VOLUME_ENUM,
  type Prediction,
} from "./types";

// VOLUME_ENUM literals (0, 0.1, ..., 1.0) have canonical IEEE-754
// representations, but computed values like `0.1 + 0.2` drift by ~1e-17 and
// would spuriously miss a naive Set lookup. We normalize via Math.round so
// the lookup is unconditionally robust to float drift, while still rejecting
// genuinely off-grid values (e.g. 0.05, 0.55).
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

const SYSTEM_PROMPT =
  "You are a bar-inventory vision model. Given a single photo of a bottle, identify which product it is from the provided list of bottle names and estimate how full the bottle is, on a scale from 0.0 (empty) to 1.0 (full), in 0.1 increments. You have exactly one tool: submit_answer. Call it exactly once with your final answer. The name MUST be copied verbatim from the list — do not paraphrase, normalize capitalization, or add commentary. After submit_answer succeeds, end the conversation.";

function buildPrompt(bottleNames: string[]): string {
  return [
    `Identify the bottle in this photo.`,
    ``,
    `Choose the closest match from this list of ${bottleNames.length} bottle names — copy the name VERBATIM:`,
    ``,
    bottleNames.join("\n"),
    ``,
    `Then estimate fill level from 0.0 to 1.0 in 0.1 steps.`,
    `Call submit_answer({ name, volume }) exactly once with your answer.`,
  ].join("\n");
}

async function* asyncIter<T>(items: T[]): AsyncIterable<T> {
  for (const item of items) yield item;
}

export async function askModel(input: {
  file: string;
  bottleNames: string[];
}): Promise<Prediction> {
  const photoPath = path.resolve(
    import.meta.dir,
    "../../../",
    PATHS.photosDir,
    input.file,
  );
  const base64 = Buffer.from(
    await Bun.file(photoPath).arrayBuffer(),
  ).toString("base64");

  let attempts = 0;
  let answer: Prediction | null = null;
  const triedInvalid: string[] = [];
  const validNames = new Set(input.bottleNames);

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
          file: input.file,
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
              text: `"${args.name}" is not in the list of valid bottle names. Pick a different name verbatim from the list.`,
            },
          ],
          isError: true,
        };
      }
      // invalid_volume
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
        { type: "text", text: buildPrompt(input.bottleNames) },
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
      systemPrompt: SYSTEM_PROMPT,
      model: DEFAULT_MODEL,
      tools: [],
      mcpServers: { eval: mcpServer },
      allowedTools: ["mcp__eval__submit_answer"],
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      persistSession: false,
    },
  });

  for await (const _ of q) {
    // drain
  }

  if (answer) return answer;
  return {
    file: input.file,
    name: "",
    volume: 0,
    error: `agent never produced a valid answer; tried [${triedInvalid.join(", ")}]`,
  };
}


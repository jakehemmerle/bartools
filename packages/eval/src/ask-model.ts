import {
  pullPromptTemplate,
  PROMPT_NAME,
  renderPromptTemplate,
  runBottleInference,
} from "@bartools/inference";
import type { AttachmentInfo } from "langsmith/schemas";

import { ATTACHMENT_KEY, fetchAttachmentBytes } from "./sync-dataset";
import { type Prediction } from "./types";

let renderedPromptPromise:
  | Promise<{ systemPrompt: string; userPrompt: string }>
  | null = null;

async function resolveRenderedPrompt() {
  if (!renderedPromptPromise) {
    renderedPromptPromise = pullPromptTemplate({
      promptName: PROMPT_NAME,
      skipCache: true,
    }).then((prompt) => renderPromptTemplate(prompt));
  }
  return renderedPromptPromise;
}

export async function askModel(input: {
  file: string;
  attachments?: Record<string, AttachmentInfo>;
}): Promise<Prediction> {
  const attachment = await fetchAttachmentBytes(input.attachments, ATTACHMENT_KEY);
  if (!attachment.ok) {
    return {
      file: input.file,
      name: "",
      volume: 0,
      error: attachment.error,
    };
  }

  const rendered = await resolveRenderedPrompt();
  const result = await runBottleInference({
    imageBytes: attachment.bytes,
    systemPrompt: rendered.systemPrompt,
    userPrompt: rendered.userPrompt,
  });

  return {
    file: input.file,
    name: result.name,
    volume: result.volume,
    ...(result.error ? { error: result.error } : {}),
  };
}

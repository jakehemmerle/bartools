import { optionalFlag, hasFlag } from "./cli";
import { client } from "./client";
import { PROMPT_NAME, pushDefaultPromptTemplate } from "./prompt";

function isMissingCommitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /commit not found/i.test(message);
}

async function main(): Promise<void> {
  const args = Bun.argv.slice(2);
  const promptName = optionalFlag(args, "--prompt-name", PROMPT_NAME);
  const force = hasFlag(args, "--force");

  const exists = await client.promptExists(promptName);
  if (!exists) {
    throw new Error(`LangSmith prompt ${promptName} does not exist`);
  }

  try {
    const existing = await client.pullPromptCommit(promptName, { skipCache: true });
    if (!force) {
      throw new Error(
        `LangSmith prompt ${promptName} already has commit ${existing.commit_hash}. Re-run with --force to overwrite.`,
      );
    }
  } catch (error) {
    if (!isMissingCommitError(error)) {
      throw error;
    }
  }

  const commitHash = await pushDefaultPromptTemplate(promptName);
  console.log(`prompt: ${promptName}:${commitHash}`);
  console.log("next: add the desired LangSmith prompt tag in the UI if you need pinned evals");
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

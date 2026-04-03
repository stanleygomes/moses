import { DEFAULT_CONTEXT_DIR } from '../../constants.js';
import { runAiReview } from '../../services/ai-tools.js';
import { ensureDefaultContextFiles, readContextPrompt } from '../../services/context.js';
import { buildMergeRequestMarkdown } from '../../services/markdown.js';
import * as display from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';
import type { ValidateOptions } from '../../types/ValidateOptions.js';
import type { MergeRequestBundle } from '../../types/MergeRequestBundle.js';

export async function runReviewTask(
  url: string,
  data: MergeRequestBundle,
  config: MosesConfig,
  options: ValidateOptions,
): Promise<void> {
  const markdownSpinner = display.spinner('Preparing context and diff...');
  try {
    await ensureDefaultContextFiles();
    const contextPrompt = await readContextPrompt(options.prompt ?? '');
    const markdown = buildMergeRequestMarkdown({
      mr: data.mr,
      diffs: data.diffs,
      commits: data.commits,
      url,
    });

    markdownSpinner.succeed(`Context and diff prepared (folder: ${DEFAULT_CONTEXT_DIR})`);

    const reviewSpinner = display.spinner('Connecting to AI tool...');
    display.info('\n🤖 Starting review with AI tool...');
    display.info('────────────────────────────────────────────────────────');

    await new Promise<void>((resolve, reject) => {
      let firstChunk = true;
      const stopSpinnerOnStart = () => {
        if (firstChunk) {
          reviewSpinner.stop();
          firstChunk = false;
        }
      };

      runAiReview(config.ai?.tool ?? 'copilot', markdown, {
        options: {
          feedbackStyle: config.ai?.feedbackStyle,
          contextPrompt,
        },
        onStdout: (chunk: string) => {
          stopSpinnerOnStart();
          display.stream(chunk);
        },
        onStderr: (chunk: string) => {
          stopSpinnerOnStart();
          display.stream(chunk);
        },
        onClose: (code: number | null) => {
          if (code === 0) {
            display.info('\n────────────────────────────────────────────────────────');
            display.success('Analysis completed');
            resolve();
          } else {
            reviewSpinner.fail('AI analysis failed');
            reject(new Error(`AI process exited with code ${String(code)}`));
          }
        },
        onError: (error: Error) => {
          reviewSpinner.fail('AI analysis failed');
          reject(error);
        },
      });
    });
  } catch (error: unknown) {
    markdownSpinner.fail('Failed to generate markdown or run AI review.');
    display.error(error instanceof Error ? error.message : 'Unknown error during AI review.');
  }
}

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
  const markdownSpinner = display.spinner('Preparando contexto e diff...');
  try {
    await ensureDefaultContextFiles();
    const contextPrompt = await readContextPrompt(options.prompt ?? '');
    const markdown = buildMergeRequestMarkdown({
      mr: data.mr,
      diffs: data.diffs,
      commits: data.commits,
      url,
    });

    markdownSpinner.succeed('Contexto e diff preparados');

    const reviewSpinner = display.spinner('Aguardando análise da IA...');
    display.info('\n🤖 Starting review with AI tool...');
    display.info('────────────────────────────────────────────────────────');

    await new Promise<void>((resolve, reject) => {
      runAiReview(config.ai?.tool ?? 'copilot', markdown, {
        options: {
          feedbackStyle: config.ai?.feedbackStyle,
          contextPrompt,
        },
        onStdout: (chunk: string) => display.streamLine(chunk),
        onStderr: (chunk: string) => display.streamLine(chunk),
        onClose: (code: number | null) => {
          if (code === 0) {
            reviewSpinner.succeed('Análise concluída');
            resolve();
          } else {
            reviewSpinner.fail('Falha na análise da IA');
            reject(new Error(`AI process exited with code ${String(code)}`));
          }
        },
        onError: (error: Error) => {
          reviewSpinner.fail('Falha na análise da IA');
          reject(error);
        },
      });
    });

    display.info('\n────────────────────────────────────────────────────────');
    display.success('Review completed!');
  } catch (error: unknown) {
    markdownSpinner.fail('Failed to generate markdown or run AI review.');
    display.error(error instanceof Error ? error.message : 'Unknown error during AI review.');
  }
}

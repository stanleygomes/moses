import { DEFAULT_CONTEXT_DIR } from '../../constants/paths.constant.js';
import { AiReviewService } from '../../services/ai-tools.js';
import { ContextService } from '../../services/context.js';
import { ContextScannerService } from '../../services/context-scanner.js';
import { MarkdownService } from '../../services/markdown.js';
import { Display } from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';
import type { ValidateOptions } from '../../types/ValidateOptions.js';
import type { MergeRequestBundle } from '../../types/MergeRequestBundle.js';

export class ValidateReviewRunner {
  static async runReviewTask(
    url: string,
    data: MergeRequestBundle,
    config: MosesConfig,
    options: ValidateOptions,
    repoPath: string | null = null,
  ): Promise<void> {
    const markdownSpinner = Display.spinner('Preparing context and diff...');
    try {
      await ContextService.ensureDefaultContextFiles();
      let contextPrompt = await ContextService.readContextPrompt(options.prompt ?? '');

      if (repoPath) {
        const repoContext = await ContextScannerService.scanRepoForContext(repoPath);
        if (repoContext) {
          contextPrompt = `${contextPrompt}\n${repoContext}`;
        }
      }

      const markdown = MarkdownService.buildMergeRequestMarkdown({
        mr: data.mr,
        diffs: data.diffs,
        commits: data.commits,
        url,
      });

      markdownSpinner.succeed(`Context and diff prepared (folder: ${DEFAULT_CONTEXT_DIR})`);

      const reviewSpinner = Display.spinner('Connecting to AI tool...');
      Display.info('\n🤖 Starting review with AI tool...');
      Display.info('────────────────────────────────────────────────────────');

      await new Promise<void>((resolve, reject) => {
        let firstChunk = true;
        const stopSpinnerOnStart = () => {
          if (firstChunk) {
            reviewSpinner.stop();
            firstChunk = false;
          }
        };

        AiReviewService.runAiReview(config.ai?.tool ?? 'copilot', markdown, {
          options: {
            feedbackStyle: config.ai?.feedbackStyle,
            contextPrompt,
          },
          onStdout: (chunk: string) => {
            stopSpinnerOnStart();
            Display.stream(chunk);
          },
          onStderr: (chunk: string) => {
            stopSpinnerOnStart();
            Display.stream(chunk);
          },
          onClose: (code: number | null) => {
            if (code === 0) {
              Display.info('\n────────────────────────────────────────────────────────');
              Display.success('Analysis completed');
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
      Display.error(error instanceof Error ? error.message : 'Unknown error during AI review.');
    }
  }
}

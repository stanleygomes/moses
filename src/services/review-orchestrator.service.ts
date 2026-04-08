import { DEFAULT_CONTEXT_DIR } from '../constants/paths.constant.js';
import { AiReviewService } from './ai-review.service.js';
import { ContextManager } from './context-manager.service.js';
import { RepoScanner } from './repo-scanner.service.js';
import { MrMarkdownFormatter } from './mr-markdown-formatter.service.js';
import { Display } from '../utils/display.util.js';
import type { MosesConfig } from '../types/moses-config.type.js';
import type { ValidateOptions } from '../types/validate-options.type.js';
import type { MergeRequestBundle } from '../types/merge-request-bundle.type.js';

export class ReviewOrchestrator {
  static async runReviewTask(
    url: string,
    data: MergeRequestBundle,
    config: MosesConfig,
    options: ValidateOptions,
    repoPath: string | null = null,
  ): Promise<void> {
    const markdownSpinner = Display.spinner('Preparing context and diff...');
    try {
      await ContextManager.ensureDefaultContextFiles();
      let contextPrompt = await ContextManager.readContextPrompt(options.prompt ?? '');

      if (repoPath) {
        const repoContext = await RepoScanner.scanRepoForContext(repoPath);
        if (repoContext) {
          contextPrompt = `${contextPrompt}\n${repoContext}`;
        }
      }

      const markdown = MrMarkdownFormatter.buildMergeRequestMarkdown({
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

import dayjs from 'dayjs';
import chalk from 'chalk';
import { AiReviewService } from './ai-review.service.js';
import { ContextManager } from './context-manager.service.js';
import { MrMarkdownFormatter } from './mr-markdown-formatter.service.js';
import { DisplayUtil } from '../utils/display.util.js';
import { RepoUtil } from '../utils/repo.util.js';
import { CONTEXT_FILE_PATTERNS } from '../constants/context.constant.js';
import { ErrorUtil } from '../utils/error.util.js';
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
    const markdownSpinner = DisplayUtil.spinner('Preparing context and diff...');
    try {
      const {
        prompt: contextPrompt,
        localFiles,
        repoFiles,
      } = await ReviewOrchestrator.buildContextPrompt(
        options.prompt ?? '',
        repoPath,
        options.instructionFile,
      );
      const markdown = ReviewOrchestrator.buildReviewMarkdown(url, data);

      markdownSpinner.succeed('Context and diff prepared');

      ReviewOrchestrator.displayMrBrief(data, url);
      ReviewOrchestrator.displayContextBrief(localFiles, repoFiles, options.prompt);

      if (repoPath && repoFiles.length === 0) {
        DisplayUtil.warn(
          'No specific context files found in repository (e.g. copilot-instructions.md, README.md)',
        );
      }

      await ReviewOrchestrator.executeAiReview(config, markdown, contextPrompt, options.model);
    } catch (error: unknown) {
      markdownSpinner.fail('Failed to generate markdown or run AI review.');
      DisplayUtil.error(ErrorUtil.getMessage(error, 'Unknown error during AI review.'));
    }
  }

  private static displayMrBrief(data: MergeRequestBundle, url: string): void {
    const { mr, diffs } = data;
    const details = [
      `${chalk.bold('Title:')}  ${mr.title}`,
      `${chalk.bold('Author:')} ${mr.author?.name || 'Unknown'} (@${mr.author?.username || 'unknown'})`,
      `${chalk.bold('Branch:')} ${mr.source_branch} → ${mr.target_branch}`,
      `${chalk.bold('Date:')}   ${dayjs(mr.created_at).format('YYYY-MM-DD')}`,
      `${chalk.bold('Stats:')}  ${diffs.length} files | changes: ${mr.changes_count ?? '?'}`,
      `${chalk.bold('URL:')}    ${chalk.dim(url)}`,
    ].join('\n');

    DisplayUtil.box(details, 'Merge Request Details', 'magenta');
  }

  private static displayContextBrief(
    localFiles: string[],
    repoFiles: string[],
    extraPrompt?: string,
  ): void {
    const sections = [];

    if (localFiles.length > 0) {
      sections.push(
        `${chalk.bold('Local Context:')}\n${localFiles.map((f) => `  • ${f}`).join('\n')}`,
      );
    }

    if (repoFiles.length > 0) {
      sections.push(
        `${chalk.bold('Repository Context:')}\n${repoFiles.map((f) => `  • ${f}`).join('\n')}`,
      );
    }

    if (extraPrompt) {
      sections.push(`${chalk.bold('Extra Prompt:')}\n  "${chalk.italic(extraPrompt)}"`);
    }

    if (sections.length === 0) {
      sections.push(chalk.dim('No extra context provided.'));
    }

    DisplayUtil.box(sections.join('\n\n'), 'Context & Instructions', 'blue');
  }

  private static async buildContextPrompt(
    extraPrompt: string,
    repoPath: string | null,
    instructionFile?: string,
  ): Promise<{ prompt: string; localFiles: string[]; repoFiles: string[] }> {
    await ContextManager.ensureDefaultSkillsFiles();
    const { prompt: baseContext, files: localFiles } = await ContextManager.readContextPrompt(
      extraPrompt,
      instructionFile,
    );
    const { prompt, repoFiles } = await ReviewOrchestrator.appendRepoContext(baseContext, repoPath);

    return { prompt, localFiles, repoFiles };
  }

  private static async appendRepoContext(
    baseContext: string,
    repoPath: string | null,
  ): Promise<{ prompt: string; repoFiles: string[] }> {
    if (!repoPath) {
      return { prompt: baseContext, repoFiles: [] };
    }

    const fileContents = await RepoUtil.readFiles(repoPath, CONTEXT_FILE_PATTERNS);

    if (fileContents.length === 0) {
      return { prompt: baseContext, repoFiles: [] };
    }

    const sections = fileContents.map((fc) => `\n## File: ${fc.path}\n\n${fc.content}`);
    const content = `\n# Internal Repository Context\n${sections.join('\n')}\n`;

    return {
      prompt: `${baseContext}\n${content}`,
      repoFiles: fileContents.map((fc) => fc.path),
    };
  }

  private static buildReviewMarkdown(url: string, data: MergeRequestBundle): string {
    return MrMarkdownFormatter.buildMergeRequestMarkdown({
      mr: data.mr,
      diffs: data.diffs,
      commits: data.commits,
      url,
    });
  }

  private static async executeAiReview(
    config: MosesConfig,
    markdown: string,
    contextPrompt: string,
    model?: string,
  ): Promise<void> {
    const reviewSpinner = DisplayUtil.spinner('Connecting to AI tool...');

    await new Promise<void>((resolve, reject) => {
      let firstChunk = true;
      const stopSpinnerOnStart = () => {
        if (firstChunk) {
          reviewSpinner.stop();
          DisplayUtil.section('AI Analysis Response');
          firstChunk = false;
        }
      };

      AiReviewService.runAiReview(config.ai?.tool ?? 'copilot', markdown, {
        options: {
          feedbackStyle: config.ai?.feedbackStyle,
          contextPrompt,
          model,
        },
        onStdout: (chunk: string) => {
          stopSpinnerOnStart();
          DisplayUtil.stream(chunk);
        },
        onStderr: (chunk: string) => {
          stopSpinnerOnStart();
          DisplayUtil.stream(chunk);
        },
        onClose: (code: number | null) => {
          if (code === 0) {
            console.log('\n');
            DisplayUtil.success('Analysis completed successfully');
            resolve();
          } else {
            console.log('\n');
            reviewSpinner.fail('AI analysis failed');
            reject(new Error(`AI process exited with code ${String(code)}`));
          }
        },
        onError: (error: Error) => {
          console.log('\n');
          reviewSpinner.fail('AI analysis failed');
          reject(error);
        },
      });
    });
  }
}

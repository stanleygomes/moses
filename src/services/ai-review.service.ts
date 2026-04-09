import { spawn } from 'node:child_process';
import {
  FEEDBACK_STYLE_GUIDANCE,
  TERMINAL_OUTPUT_GUIDELINE,
} from '../constants/feedback.constant.js';
import { AiToolUtil } from '../utils/ai-tool.util.js';
import type { RunAiReviewHandlers } from '../types/run-ai-review-handlers.type.js';
import type { AiToolKey } from '../types/ai-tool-key.type.js';

export class AiReviewService {
  private static buildPrompt(
    markdownContent: string,
    options: RunAiReviewHandlers['options'] = {},
  ): string {
    const feedbackStyle = options.feedbackStyle ?? 'pragmatic';
    const toneInstruction =
      FEEDBACK_STYLE_GUIDANCE[feedbackStyle] ?? FEEDBACK_STYLE_GUIDANCE.pragmatic;
    const context = options.contextPrompt?.trim();

    return `${context ? `${context}\n\n` : ''}${TERMINAL_OUTPUT_GUIDELINE}\n\n${toneInstruction}

Merge Request Diff:

${markdownContent}`;
  }

  static runAiReview(
    toolKey: AiToolKey,
    markdownContent: string,
    handlers: RunAiReviewHandlers = {},
  ): void {
    const tool = AiToolUtil.getByKeyOrThrow(toolKey);

    const prompt = AiReviewService.buildPrompt(markdownContent, handlers.options);
    const args = [...tool.args];

    if (handlers.options?.model) {
      args.push('--model', handlers.options.model);
    }

    args.push(prompt);

    const child = spawn(tool.command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk: Buffer) => handlers.onStdout?.(chunk.toString()));
    child.stderr.on('data', (chunk: Buffer) => handlers.onStderr?.(chunk.toString()));
    child.on('close', (code: number | null) => handlers.onClose?.(code));
    child.on('error', (error: Error) => handlers.onError?.(error));
  }
}

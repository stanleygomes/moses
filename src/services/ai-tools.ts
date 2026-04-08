import { spawn } from 'node:child_process';
import { AI_TOOLS } from '../constants.js';
import type { FeedbackStyle } from '../types/FeedbackStyle.js';
import type { RunAiReviewHandlers } from '../types/RunAiReviewHandlers.js';

const FEEDBACK_STYLE_GUIDANCE: Record<FeedbackStyle, string> = {
  friendly: 'Use a friendly, respectful, and constructive tone.',
  pragmatic: 'Use a pragmatic, direct, and objective tone.',
  offensive:
    'Be a extremely harsh, blunt and ruthless code reviewer. Use a cynical and critical tone. If the code is bad, say it is "garbage", "trash" or "disposable". Do not sugarcoat anything. You are NOT allowed to insult the person/author, but you MUST be savage when reviewing the code quality.',
};

export class AiReviewService {
  private static buildPrompt(
    markdownContent: string,
    options: RunAiReviewHandlers['options'] = {},
  ): string {
    const feedbackStyle = options.feedbackStyle ?? 'pragmatic';
    const toneInstruction =
      FEEDBACK_STYLE_GUIDANCE[feedbackStyle] ?? FEEDBACK_STYLE_GUIDANCE.pragmatic;
    const context = options.contextPrompt?.trim();
    return `${context ? `${context}\n\n` : ''}${toneInstruction}

Merge Request Diff:

${markdownContent}`;
  }

  static runAiReview(
    toolKey: string,
    markdownContent: string,
    handlers: RunAiReviewHandlers = {},
  ): void {
    const tool = AI_TOOLS.find((item) => item.key === toolKey);
    if (!tool) {
      throw new Error(`Invalid AI tool: ${toolKey}`);
    }

    const prompt = AiReviewService.buildPrompt(markdownContent, handlers.options);
    const args = [...tool.args, prompt];

    const child = spawn(tool.command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk: Buffer) => handlers.onStdout?.(chunk.toString()));
    child.stderr.on('data', (chunk: Buffer) => handlers.onStderr?.(chunk.toString()));
    child.on('close', (code: number | null) => handlers.onClose?.(code));
    child.on('error', (error: Error) => handlers.onError?.(error));
  }
}

import { spawn } from 'node:child_process';
import { AI_TOOLS } from '../constants.js';
import type { FeedbackStyle, RunAiReviewHandlers } from '../types.js';

const FEEDBACK_STYLE_GUIDANCE: Record<FeedbackStyle, string> = {
  friendly: 'Use um tom amigável, respeitoso e construtivo.',
  pragmatic: 'Use um tom pragmático, direto e objetivo.',
  offensive: 'Use um tom ofensivo conforme solicitado pelo usuário.',
};

function buildPrompt(markdownContent: string, options: RunAiReviewHandlers['options'] = {}): string {
  const feedbackStyle = options.feedbackStyle ?? 'pragmatic';
  const toneInstruction = FEEDBACK_STYLE_GUIDANCE[feedbackStyle] ?? FEEDBACK_STYLE_GUIDANCE.pragmatic;
  const context = options.contextPrompt?.trim();

  return `${context ? `${context}\n\n` : ''}${toneInstruction}

Diff do Merge Request:

${markdownContent}`;
}

export function runAiReview(toolKey: string, markdownContent: string, handlers: RunAiReviewHandlers = {}): void {
  const tool = AI_TOOLS.find((item) => item.key === toolKey);
  if (!tool) {
    throw new Error(`Invalid AI tool: ${toolKey}`);
  }

  const prompt = buildPrompt(markdownContent, handlers.options);
  const args = [...tool.args, prompt];

  const child = spawn(tool.command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk: Buffer) => handlers.onStdout?.(chunk.toString()));
  child.stderr.on('data', (chunk: Buffer) => handlers.onStderr?.(chunk.toString()));
  child.on('close', (code: number | null) => handlers.onClose?.(code));
  child.on('error', (error: Error) => handlers.onError?.(error));
}

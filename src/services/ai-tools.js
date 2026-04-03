import { spawn } from 'node:child_process';
import { AI_TOOLS } from '../constants.js';

const FEEDBACK_STYLE_GUIDANCE = {
  amigavel: 'Use um tom amigável, respeitoso e construtivo.',
  pragmatico: 'Use um tom pragmático, direto e objetivo.',
  ofensivo: 'Use um tom ofensivo conforme solicitado pelo usuário.',
};

function buildPrompt(markdownContent, options = {}) {
  const feedbackStyle = options.feedbackStyle ?? 'pragmatico';
  const toneInstruction = FEEDBACK_STYLE_GUIDANCE[feedbackStyle] ?? FEEDBACK_STYLE_GUIDANCE.pragmatico;
  const context = options.contextPrompt?.trim();

  return `${context ? `${context}\n\n` : ''}${toneInstruction}

Diff do Merge Request:

${markdownContent}`;
}

export function runAiReview(toolKey, markdownContent, handlers = {}) {
  const tool = AI_TOOLS.find((item) => item.key === toolKey);
  if (!tool) {
    throw new Error(`Invalid AI tool: ${toolKey}`);
  }

  const prompt = buildPrompt(markdownContent, handlers.options);
  const args = [...tool.args, prompt];

  const child = spawn(tool.command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => handlers.onStdout?.(chunk.toString()));
  child.stderr.on('data', (chunk) => handlers.onStderr?.(chunk.toString()));
  child.on('close', (code) => handlers.onClose?.(code));
  child.on('error', (error) => handlers.onError?.(error));
}

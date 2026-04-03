import { spawn } from 'node:child_process';
import { AI_TOOLS } from '../constants.js';

function buildPrompt({ basePrompt, practicesPrompt, feedbackStyle, userPrompt, markdownContent }) {
  const sections = [
    basePrompt?.trim() ?? '',
    practicesPrompt?.trim() ?? '',
    feedbackStyle ? `Estilo de feedback: ${feedbackStyle}` : '',
    userPrompt ? `Contexto adicional do usuário:\n${userPrompt.trim()}` : '',
    `Conteúdo do MR para análise:\n\n${markdownContent}`,
  ].filter(Boolean);
  return sections.join('\n\n---\n\n');
}

export function runAiReview(toolKey, promptData, handlers = {}) {
  const tool = AI_TOOLS.find((item) => item.key === toolKey);
  if (!tool) {
    throw new Error(`Invalid AI tool: ${toolKey}`);
  }

  const prompt = buildPrompt(promptData);
  const args = [...tool.args, prompt];

  const child = spawn(tool.command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => handlers.onStdout?.(chunk.toString()));
  child.stderr.on('data', (chunk) => handlers.onStderr?.(chunk.toString()));
  child.on('close', (code) => handlers.onClose?.(code));
  child.on('error', (error) => handlers.onError?.(error));
}

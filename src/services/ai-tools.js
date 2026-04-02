import { spawn } from 'node:child_process';
import { AI_TOOLS } from '../constants.js';

function buildPrompt(markdownContent) {
  return `You are a senior code reviewer. Analyze the Merge Request diff below and provide detailed technical feedback on: code quality, potential bugs, security, performance, best practices, and improvement suggestions.

${markdownContent}`;
}

export function runAiReview(toolKey, markdownContent, handlers = {}) {
  const tool = AI_TOOLS.find((item) => item.key === toolKey);
  if (!tool) {
    throw new Error(`Invalid AI tool: ${toolKey}`);
  }

  const prompt = buildPrompt(markdownContent);
  const args = [...tool.args, prompt];

  const child = spawn(tool.command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => handlers.onStdout?.(chunk.toString()));
  child.stderr.on('data', (chunk) => handlers.onStderr?.(chunk.toString()));
  child.on('close', (code) => handlers.onClose?.(code));
  child.on('error', (error) => handlers.onError?.(error));
}

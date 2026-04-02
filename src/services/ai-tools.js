import { spawn } from 'node:child_process';
import { AI_TOOLS } from '../constants.js';

function buildPrompt(markdownContent) {
  return `Você é um revisor de código sênior. Analise o diff abaixo de um Merge Request e forneça comentários técnicos detalhados sobre: qualidade do código, possíveis bugs, segurança, performance, boas práticas e sugestões de melhoria.

${markdownContent}`;
}

export function runAiReview(toolKey, markdownContent, handlers = {}) {
  const tool = AI_TOOLS.find((item) => item.key === toolKey);
  if (!tool) {
    throw new Error(`Ferramenta de IA inválida: ${toolKey}`);
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

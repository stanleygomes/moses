import type { AiToolDefinition } from '../types/AiToolDefinition.js';

export const DEFAULT_MAX_DIFF_CHANGES = 1200;

export const AI_TOOLS: AiToolDefinition[] = [
  {
    key: 'copilot',
    name: 'GitHub Copilot CLI (copilot)',
    command: 'copilot',
    args: ['-p'],
    install: 'npm install -g @github/copilot',
    docs: 'https://docs.github.com/copilot/github-copilot-in-the-cli',
  },
  {
    key: 'gemini',
    name: 'Google Gemini CLI (gemini)',
    command: 'gemini',
    args: ['generate-text'],
    install: 'npm install -g @google/gemini-cli',
    docs: 'https://cloud.google.com/ai/docs',
  },
];

import type { AiToolDefinition } from '../types/ai-tool-definition.type.js';

export const DEFAULT_MAX_DIFF_CHANGES = 500;

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

export const TOOL_MODELS: Record<string, { name: string; value: string }[]> = {
  gemini: [
    { name: 'Gemini 3.1 Pro', value: 'gemini-3.1-pro' },
    { name: 'Gemini 3 Flash', value: 'gemini-3-flash' },
    { name: 'Gemini 3 Pro', value: 'gemini-3-pro' },
  ],
  copilot: [
    { name: 'Claude Sonnet 4.6 (1x)', value: 'claude-sonnet-4.6' },
    { name: 'Claude Sonnet 4.5 (1x)', value: 'claude-sonnet-4.5' },
    { name: 'Claude Haiku 4.5 (0.33x)', value: 'claude-haiku-4.5' },
    { name: 'Claude Opus 4.6 (3x)', value: 'claude-opus-4.6' },
    { name: 'Claude Opus 4.5 (3x)', value: 'claude-opus-4.5' },
    { name: 'Claude Sonnet 4 (1x)', value: 'claude-sonnet-4' },
    { name: 'GPT-5.4 (1x)', value: 'gpt-5.4' },
    { name: 'GPT-5.3 Codex (1x)', value: 'gpt-5.3-codex' },
    { name: 'GPT-5.2 Codex (1x)', value: 'gpt-5.2-codex' },
    { name: 'GPT-5.2 (1x)', value: 'gpt-5.2' },
    { name: 'GPT-5.1 (1x)', value: 'gpt-5.1' },
    { name: 'GPT-5 mini (0x)', value: 'gpt-5-mini' },
    { name: 'GPT-4.1 (0x)', value: 'gpt-4.1' },
  ],
};

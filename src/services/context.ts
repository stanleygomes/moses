import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.resolve(__dirname, '../prompts');

const resolveHome = (value: string): string => value.replace(/^~(?=\/|$)/, os.homedir());

export function getContextDir(): string {
  return resolveHome('~/.config/moses/context');
}

export function getBasePromptPath(): string {
  return path.join(getContextDir(), 'base-prompt.md');
}

export function getPracticesPath(): string {
  return path.join(getContextDir(), 'mr-practices.md');
}

export async function ensureDefaultContextFiles(): Promise<void> {
  const contextDir = getContextDir();
  await fs.mkdir(contextDir, { recursive: true });

  const basePromptPath = getBasePromptPath();
  const practicesPath = getPracticesPath();

  try {
    await fs.access(basePromptPath);
  } catch {
    const defaultBasePrompt = await fs.readFile(path.join(PROMPTS_DIR, 'base-prompt.md'), 'utf-8');
    await fs.writeFile(basePromptPath, defaultBasePrompt, 'utf-8');
  }

  try {
    await fs.access(practicesPath);
  } catch {
    const defaultPractices = await fs.readFile(path.join(PROMPTS_DIR, 'mr-practices.md'), 'utf-8');
    await fs.writeFile(practicesPath, defaultPractices, 'utf-8');
  }
}

export async function readContextPrompt(extraPrompt = ''): Promise<string> {
  const [basePrompt, practices] = await Promise.all([
    fs.readFile(getBasePromptPath(), 'utf-8'),
    fs.readFile(getPracticesPath(), 'utf-8'),
  ]);

  const segments = [basePrompt.trim(), practices.trim()];
  if (extraPrompt.trim()) {
    segments.push(`# Contexto adicional do usuário\n${extraPrompt.trim()}`);
  }
  return `${segments.join('\n\n')}\n`;
}

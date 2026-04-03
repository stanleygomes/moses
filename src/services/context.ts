import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_CONTEXT_DIR } from '../constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.resolve(__dirname, '../prompts');

const resolveHome = (value: string): string => value.replace(/^~(?=\/|$)/, os.homedir());

export function getContextDir(): string {
  return resolveHome(DEFAULT_CONTEXT_DIR);
}

export async function ensureDefaultContextFiles(): Promise<void> {
  const contextDir = getContextDir();
  await fs.mkdir(contextDir, { recursive: true });

  const files = await fs.readdir(PROMPTS_DIR);
  for (const file of files) {
    const srcPath = path.join(PROMPTS_DIR, file);
    const destPath = path.join(contextDir, file);

    try {
      await fs.access(destPath);
    } catch {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export async function readContextPrompt(extraPrompt = ''): Promise<string> {
  const contextDir = getContextDir();
  const files = await fs.readdir(contextDir);
  const mdFiles = files.filter((file) => file.endsWith('.md')).sort();

  const contents = await Promise.all(
    mdFiles.map((file) => fs.readFile(path.join(contextDir, file), 'utf-8')),
  );

  const segments = contents.map((c) => c.trim());
  if (extraPrompt.trim()) {
    segments.push(`# Contexto adicional do usuário\n${extraPrompt.trim()}`);
  }
  return `${segments.join('\n\n')}\n`;
}

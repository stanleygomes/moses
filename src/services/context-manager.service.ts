import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_CONTEXT_DIR } from '../constants/paths.constant.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.resolve(__dirname, '../prompts');

export class ContextManager {
  private static resolveHome(value: string): string {
    return value.replace(/^~(?=\/|$)/, os.homedir());
  }

  static getContextDir(): string {
    return ContextManager.resolveHome(DEFAULT_CONTEXT_DIR);
  }

  static async ensureDefaultContextFiles(): Promise<{
    contextDir: string;
    files: string[];
  }> {
    const contextDir = ContextManager.getContextDir();
    await ContextManager.ensureContextDirectory(contextDir);
    const files = await ContextManager.listPromptFiles();
    await ContextManager.copyMissingPromptFiles(files, contextDir);
    return { contextDir, files };
  }

  static async readContextPrompt(extraPrompt = ''): Promise<string> {
    const contextDir = ContextManager.getContextDir();
    const mdFiles = await ContextManager.listMarkdownFiles(contextDir);
    const segments = await ContextManager.readTrimmedContents(contextDir, mdFiles);
    return ContextManager.buildContextPrompt(segments, extraPrompt);
  }

  private static async ensureContextDirectory(contextDir: string): Promise<void> {
    await fs.mkdir(contextDir, { recursive: true });
  }

  private static async listPromptFiles(): Promise<string[]> {
    return fs.readdir(PROMPTS_DIR);
  }

  private static async copyMissingPromptFiles(files: string[], contextDir: string): Promise<void> {
    for (const file of files) {
      await ContextManager.copyPromptFileIfMissing(file, contextDir);
    }
  }

  private static async copyPromptFileIfMissing(file: string, contextDir: string): Promise<void> {
    const srcPath = path.join(PROMPTS_DIR, file);
    const destPath = path.join(contextDir, file);

    try {
      await fs.access(destPath);
    } catch {
      await fs.copyFile(srcPath, destPath);
    }
  }

  private static async listMarkdownFiles(contextDir: string): Promise<string[]> {
    const files = await fs.readdir(contextDir);
    return files.filter((file) => file.endsWith('.md')).sort();
  }

  private static async readTrimmedContents(contextDir: string, files: string[]): Promise<string[]> {
    const contents = await Promise.all(
      files.map((file) => fs.readFile(path.join(contextDir, file), 'utf-8')),
    );
    return contents.map((content) => content.trim());
  }

  private static buildContextPrompt(segments: string[], extraPrompt: string): string {
    const promptSegments = [...segments];
    if (extraPrompt.trim()) {
      promptSegments.push(`# Additional user context\n${extraPrompt.trim()}`);
    }
    return `${promptSegments.join('\n\n')}\n`;
  }
}

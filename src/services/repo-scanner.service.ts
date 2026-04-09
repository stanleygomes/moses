import fs from 'node:fs/promises';
import path from 'node:path';
import { CONTEXT_FILE_PATTERNS } from '../constants/context.constant.js';
import type { RepoContextResult } from '../types/repo-context-result.type.js';

export class RepoScanner {
  static async scanRepoForContext(repoPath: string): Promise<RepoContextResult> {
    const contents: string[] = [];
    const files: string[] = [];

    for (const pattern of CONTEXT_FILE_PATTERNS) {
      const fullPath = path.join(repoPath, pattern);

      try {
        const stats = await fs.stat(fullPath);
        if (stats.isFile()) {
          const fileContent = await fs.readFile(fullPath, 'utf-8');
          contents.push(`\n## File: ${pattern}\n\n${fileContent.trim()}`);
          files.push(pattern);
        }
      } catch {
        // File doesn't exist or is not accessible, skip
      }
    }

    if (contents.length === 0) return { content: '', files: [] };

    return {
      content: `\n# Internal Repository Context\n${contents.join('\n')}\n`,
      files,
    };
  }
}

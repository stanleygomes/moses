import fs from 'node:fs/promises';
import path from 'node:path';
import { CONTEXT_FILE_PATTERNS } from '../constants.js';

/**
 * Scans a repository directory for files matching the context patterns.
 * Returns the contents of these files formatted for LLM context.
 */
export class ContextScannerService {
  static async scanRepoForContext(repoPath: string): Promise<string> {
    const contents: string[] = [];

    for (const pattern of CONTEXT_FILE_PATTERNS) {
      const fullPath = path.join(repoPath, pattern);

      try {
        const stats = await fs.stat(fullPath);
        if (stats.isFile()) {
          const fileContent = await fs.readFile(fullPath, 'utf-8');
          contents.push(`\n## File: ${pattern}\n\n${fileContent.trim()}`);
        }
      } catch {
        // File doesn't exist or is not accessible, skip
      }
    }

    if (contents.length === 0) return '';

    return `\n# Internal Repository Context\n${contents.join('\n')}\n`;
  }
}

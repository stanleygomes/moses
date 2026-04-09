import fs from 'node:fs/promises';
import path from 'node:path';

export interface FileContent {
  path: string;
  content: string;
}

export class RepoUtil {
  static async readFiles(folder: string, patterns: string[]): Promise<FileContent[]> {
    const results: FileContent[] = [];

    for (const pattern of patterns) {
      const fullPath = path.join(folder, pattern);

      try {
        const stats = await fs.stat(fullPath);
        if (stats.isFile()) {
          const content = await fs.readFile(fullPath, 'utf-8');
          results.push({
            path: pattern,
            content: content.trim(),
          });
        }
      } catch {
        // File doesn't exist or is not accessible, skip
      }
    }

    return results;
  }
}

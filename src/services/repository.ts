import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { DEFAULT_REPOS_DIR } from '../constants/paths.constant.js';

export class RepositoryService {
  private static normalize(url: string): string {
    return url
      .replace(/\.git$/, '')
      .replace(/\/$/, '')
      .toLowerCase();
  }

  static isCurrentDirMatchingRepo(targetRemoteUrl: string): boolean {
    try {
      const remotes = execSync('git remote -v', {
        stdio: ['ignore', 'pipe', 'ignore'],
        encoding: 'utf-8',
      });
      const normalizedTarget = RepositoryService.normalize(targetRemoteUrl);

      return remotes.split('\n').some((line) => {
        const match = line.match(/\t(\S+)\s+\((?:fetch|push)\)/);
        if (match) {
          return RepositoryService.normalize(match[1]) === normalizedTarget;
        }
        return false;
      });
    } catch {
      return false;
    }
  }

  static async cloneRepository(repoUrl: string, token: string): Promise<string> {
    const reposDir = DEFAULT_REPOS_DIR.replace(/^~(?=\/|$)/, os.homedir());
    await fs.mkdir(reposDir, { recursive: true });

    const url = new URL(repoUrl);
    const dirName = `${url.hostname}${url.pathname.replace(/\//g, '-')}`.replace(/\.git$/, '');
    const targetPath = path.join(reposDir, dirName);

    try {
      await fs.access(path.join(targetPath, '.git'));
      return targetPath;
    } catch {
      // Continue to clone
    }

    const authUrl = repoUrl.replace(/^https:\/\//, `https://oauth2:${token}@`);

    try {
      execSync(`git clone --depth 1 ${authUrl} ${targetPath}`, { stdio: 'inherit' });
      return targetPath;
    } catch (error) {
      throw new Error(
        `Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static getRepoUrlFromMrUrl(mrUrl: string): string {
    const url = new URL(mrUrl);
    const parts = url.pathname.split('/-/');
    if (parts.length < 1) throw new Error('Invalid Merge Request URL');

    return `${url.origin}${parts[0]}.git`;
  }
}

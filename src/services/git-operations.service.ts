import { execFileSync, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { DEFAULT_REPOS_DIR } from '../constants/paths.constant.js';

export class GitOperationsService {
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
      const normalizedTarget = GitOperationsService.normalize(targetRemoteUrl);

      return remotes.split('\n').some((line) => {
        const match = line.match(/\t(\S+)\s+\((?:fetch|push)\)/);
        if (match) {
          return GitOperationsService.normalize(match[1]) === normalizedTarget;
        }
        return false;
      });
    } catch {
      return false;
    }
  }

  static async cloneRepository(repoUrl: string, token: string): Promise<string> {
    const targetPath = await GitOperationsService.resolveTargetPath(repoUrl);
    if (await GitOperationsService.isRepositoryCloned(targetPath)) {
      return targetPath;
    }

    const authUrl = GitOperationsService.buildAuthenticatedUrl(repoUrl, token);
    try {
      GitOperationsService.runClone(authUrl, targetPath);
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

  private static resolveReposDir(): string {
    return DEFAULT_REPOS_DIR.replace(/^~(?=\/|$)/, os.homedir());
  }

  private static async resolveTargetPath(repoUrl: string): Promise<string> {
    const reposDir = GitOperationsService.resolveReposDir();
    await fs.mkdir(reposDir, { recursive: true });
    const url = new URL(repoUrl);
    const dirName = `${url.hostname}${url.pathname.replace(/\//g, '-')}`.replace(/\.git$/, '');
    return path.join(reposDir, dirName);
  }

  private static async isRepositoryCloned(targetPath: string): Promise<boolean> {
    try {
      await fs.access(path.join(targetPath, '.git'));
      return true;
    } catch {
      return false;
    }
  }

  private static buildAuthenticatedUrl(repoUrl: string, token: string): string {
    return repoUrl.replace(/^https:\/\//, `https://oauth2:${token}@`);
  }

  private static runClone(authUrl: string, targetPath: string): void {
    execFileSync('git', ['clone', '--depth', '1', authUrl, targetPath], {
      stdio: 'inherit',
    });
  }
}

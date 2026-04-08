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

    try {
      GitOperationsService.runClone(repoUrl, token, targetPath);
      return targetPath;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? GitOperationsService.maskToken(error.message, token)
          : String(error);
      throw new Error(`Failed to clone repository: ${errorMessage}`);
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

  private static buildCloneEnv(token: string): Record<string, string | undefined> {
    const basicAuth = Buffer.from(`oauth2:${token}`).toString('base64');
    return {
      ...process.env,
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: 'http.extraHeader',
      GIT_CONFIG_VALUE_0: `Authorization: Basic ${basicAuth}`,
    };
  }

  private static runClone(repoUrl: string, token: string, targetPath: string): void {
    execFileSync('git', ['clone', '--depth', '1', repoUrl, targetPath], {
      stdio: 'inherit',
      env: GitOperationsService.buildCloneEnv(token),
    });
  }

  private static maskToken(text: string, token: string): string {
    if (!token) return text;
    const basicAuth = Buffer.from(`oauth2:${token}`).toString('base64');
    const encodedToken = encodeURIComponent(token);
    return [token, encodedToken, basicAuth].reduce(
      (maskedText, secret) => (secret ? maskedText.replaceAll(secret, '***') : maskedText),
      text,
    );
  }
}

import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { DEFAULT_REPOS_DIR } from '../constants.js';

/**
 * Checks if the current working directory is a git repository
 * and if it matches the target remote URL.
 */
export function isCurrentDirMatchingRepo(targetRemoteUrl: string): boolean {
  try {
    // Check if .git exists
    const remotes = execSync('git remote -v', {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf-8',
    });

    // Normalize target URL (remove .git suffix if present, remove trailing slash)
    const normalize = (url: string) =>
      url
        .replace(/\.git$/, '')
        .replace(/\/$/, '')
        .toLowerCase();
    const normalizedTarget = normalize(targetRemoteUrl);

    return remotes.split('\n').some((line) => {
      const match = line.match(/\t(\S+)\s+\((?:fetch|push)\)/);
      if (match) {
        return normalize(match[1]) === normalizedTarget;
      }
      return false;
    });
  } catch {
    return false;
  }
}

/**
 * Clones a repository to the local storage if not already present.
 * Returns the path to the cloned repository.
 */
export async function cloneRepository(repoUrl: string, token: string): Promise<string> {
  const reposDir = DEFAULT_REPOS_DIR.replace(/^~(?=\/|$)/, os.homedir());
  await fs.mkdir(reposDir, { recursive: true });

  // Create a directory name based on the repo URL (e.g. gitlab.com-group-repo)
  const url = new URL(repoUrl);
  const dirName = `${url.hostname}${url.pathname.replace(/\//g, '-')}`.replace(/\.git$/, '');
  const targetPath = path.join(reposDir, dirName);

  // If directory exists, check if it's a git repo
  try {
    await fs.access(path.join(targetPath, '.git'));
    // Potentially git pull here to keep it updated?
    // For now, just return the path to avoid re-cloning.
    return targetPath;
  } catch {
    // Not a repo or doesn't exist, proceed to clone
  }

  // Inject token for authentication if needed (GitLab format: https://oauth2:TOKEN@host/group/repo.git)
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

/**
 * Extracts the repository URL from a Merge Request URL.
 * Example: https://gitlab.com/group/repo/-/merge_requests/1 -> https://gitlab.com/group/repo.git
 */
export function getRepoUrlFromMrUrl(mrUrl: string): string {
  const url = new URL(mrUrl);
  const parts = url.pathname.split('/-/');
  if (parts.length < 1) throw new Error('Invalid Merge Request URL');

  return `${url.origin}${parts[0]}.git`;
}

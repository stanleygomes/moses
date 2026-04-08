import { GitOperationsService } from './git-operations.service.js';
import { UrlParser } from '../utils/url.util.js';
import { ConfigStore } from '../store/config.store.js';
import { Display } from '../utils/display.util.js';
import { Prompt } from '../utils/prompt.util.js';
import { ErrorUtil } from '../utils/error.util.js';
import type { MosesConfig } from '../types/moses-config.type.js';

export class GitRepoResolver {
  static async resolveRepositoryPath(url: string, config: MosesConfig): Promise<string | null> {
    const targetRepoUrl = GitOperationsService.getRepoUrlFromMrUrl(url);

    const localRepositoryPath = GitRepoResolver.resolveCurrentDirectoryRepository(targetRepoUrl);
    if (localRepositoryPath) {
      return localRepositoryPath;
    }

    const shouldDownload = await GitRepoResolver.promptForRepositoryDownload();
    if (!shouldDownload) return null;

    return GitRepoResolver.downloadRepository(url, targetRepoUrl, config);
  }

  private static async downloadRepository(
    url: string,
    targetRepoUrl: string,
    config: MosesConfig,
  ): Promise<string | null> {
    const parsedUrl = UrlParser.parseMergeRequestUrl(url);
    const gitlabConfig = ConfigStore.findGitlabInstance(config, parsedUrl.host);

    if (!gitlabConfig) {
      Display.error(`No GitLab instance configured for host: ${parsedUrl.host}`);
      return null;
    }

    return GitRepoResolver.cloneRepositoryWithFeedback(targetRepoUrl, gitlabConfig.token);
  }

  private static resolveCurrentDirectoryRepository(targetRepoUrl: string): string | null {
    if (!GitOperationsService.isCurrentDirMatchingRepo(targetRepoUrl)) {
      return null;
    }

    Display.success('✅ Repository detected in current directory. Using local context.');
    return process.cwd();
  }

  private static async promptForRepositoryDownload(): Promise<boolean> {
    Display.info('📂 Current directory does not match the MR repository.');
    return Prompt.confirm({
      message: 'Do you want to download the repository locally to provide more context to the AI?',
      default: true,
    });
  }

  private static async cloneRepositoryWithFeedback(
    targetRepoUrl: string,
    token: string,
  ): Promise<string | null> {
    const spinner = Display.spinner('Cloning repository...');
    try {
      const repoPath = await GitOperationsService.cloneRepository(targetRepoUrl, token);
      spinner.succeed(`Repository cloned to: ${repoPath}`);
      return repoPath;
    } catch (error) {
      spinner.fail('Failed to clone repository.');
      Display.error(ErrorUtil.getMessage(error, 'Unknown error during clone.'));
      return null;
    }
  }
}

import { MESSAGES } from '../../constants/messages.constant.js';
import { Display } from '../../utils/display.util.js';
import { ValidateGitlabDataProvider } from './gitlab.js';
import { DiffLimitChecker } from './check-limits.js';
import { ValidateReviewRunner } from './review.js';
import { RepositoryService } from '../../services/repository.js';
import { UrlParser } from '../../utils/url.util.js';
import { ConfigStore } from '../../store/config.store.js';
import { Prompt } from '../../utils/prompt.util.js';
import type { ValidateOptions } from '../../types/validate-options.type.js';

export class ValidateModule {
  static async run(url: string, options: ValidateOptions = {}): Promise<void> {
    Display.banner();
    Display.info(`🔗 Analyzing: ${url}`);

    const config = await ConfigStore.getSafe();
    if (!config) {
      Display.error(MESSAGES.noConfig);
      return;
    }

    const data = await ValidateGitlabDataProvider.fetchMrData(url, config);
    if (!data) return;

    if (!DiffLimitChecker.isDiffWithinLimits(data.diffs, config)) return;

    let repoPath: string | null = null;
    const targetRepoUrl = RepositoryService.getRepoUrlFromMrUrl(url);

    if (RepositoryService.isCurrentDirMatchingRepo(targetRepoUrl)) {
      Display.success('✅ Repository detected in current directory. Using local context.');
      repoPath = process.cwd();
    } else {
      Display.info('📂 Current directory does not match the MR repository.');
      const shouldDownload = await Prompt.confirm({
        message:
          'Do you want to download the repository locally to provide more context to the AI?',
        default: true,
      });

      if (shouldDownload) {
        const parsedUrl = UrlParser.parseMergeRequestUrl(url);
        const gitlabConfig = ConfigStore.findGitlabInstance(config, parsedUrl.host);

        if (!gitlabConfig) {
          Display.error(`No GitLab instance configured for host: ${parsedUrl.host}`);
          return;
        }

        const spinner = Display.spinner('Cloning repository...');
        try {
          repoPath = await RepositoryService.cloneRepository(targetRepoUrl, gitlabConfig.token);
          spinner.succeed(`Repository cloned to: ${repoPath}`);
        } catch (error) {
          spinner.fail('Failed to clone repository.');
          Display.error(error instanceof Error ? error.message : 'Unknown error during clone.');
        }
      }
    }

    await ValidateReviewRunner.runReviewTask(url, data, config, options, repoPath);
  }
}

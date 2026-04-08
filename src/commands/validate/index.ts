import { confirm } from '@inquirer/prompts';
import * as display from '../../utils/display.js';
import { loadValidatedConfig } from './load-config.js';
import { fetchMrData } from './gitlab.js';
import { isDiffWithinLimits } from './check-limits.js';
import { runReviewTask } from './review.js';
import {
  isCurrentDirMatchingRepo,
  getRepoUrlFromMrUrl,
  cloneRepository,
} from '../../services/repository.js';
import { parseMergeRequestUrl } from '../../utils/url-parser.js';
import { findGitlabInstance } from '../../utils/config-store.js';
import type { ValidateOptions } from '../../types/ValidateOptions.js';

export async function execute(url: string, options: ValidateOptions = {}): Promise<void> {
  display.banner();
  display.info(`🔗 Analyzing: ${url}`);

  const config = await loadValidatedConfig();
  if (!config) return;

  const data = await fetchMrData(url, config);
  if (!data) return;

  if (!isDiffWithinLimits(data.diffs, config)) return;

  // Repository context logic
  let repoPath: string | null = null;
  const targetRepoUrl = getRepoUrlFromMrUrl(url);

  if (isCurrentDirMatchingRepo(targetRepoUrl)) {
    display.success('✅ Repository detected in current directory. Using local context.');
    repoPath = process.cwd();
  } else {
    display.info('📂 Current directory does not match the MR repository.');
    const shouldDownload = await confirm({
      message: 'Do you want to download the repository locally to provide more context to the AI?',
      default: true,
    });

    if (shouldDownload) {
      const parsedUrl = parseMergeRequestUrl(url);
      const gitlabConfig = findGitlabInstance(config, parsedUrl.host);

      if (!gitlabConfig) {
        display.error(`No GitLab instance configured for host: ${parsedUrl.host}`);
        return;
      }

      const spinner = display.spinner('Cloning repository...');
      try {
        repoPath = await cloneRepository(targetRepoUrl, gitlabConfig.token);
        spinner.succeed(`Repository cloned to: ${repoPath}`);
      } catch (error) {
        spinner.fail('Failed to clone repository.');
        display.error(error instanceof Error ? error.message : 'Unknown error during clone.');
        // Proceeding without repo context if clone fails
      }
    }
  }

  await runReviewTask(url, data, config, options, repoPath);
}

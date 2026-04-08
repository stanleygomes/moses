import { Display } from '../utils/display.util.js';
import { GitlabDataProvider } from '../services/gitlab-data-provider.service.js';
import { UsageLimitService } from '../services/usage-limit.service.js';
import { ReviewOrchestrator } from '../services/review-orchestrator.service.js';
import { ConfigValidator } from '../services/config-validator.service.js';
import { GitRepoResolver } from '../services/git-repo-resolver.service.js';
import type { ValidateOptions } from '../types/validate-options.type.js';

export class ValidateModule {
  static async run(url: string, options: ValidateOptions = {}): Promise<void> {
    Display.banner();
    Display.info(`🔗 Analyzing: ${url}`);

    const config = await ConfigValidator.getConfig();
    if (!config) return;

    const data = await GitlabDataProvider.fetchMrData(url, config);
    if (!data) return;

    if (!UsageLimitService.isDiffWithinLimits(data.diffs, config)) return;

    const repoPath = await GitRepoResolver.resolveRepositoryPath(url, config);

    await ReviewOrchestrator.runReviewTask(url, data, config, options, repoPath);
  }
}

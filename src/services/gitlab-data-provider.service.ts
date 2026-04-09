import { HttpUtil } from '../utils/http.util.js';
import { GitlabClient } from '../api/gitlab/gitlab.client.js';
import { ConfigStore } from '../store/config.store.js';
import { DisplayUtil } from '../utils/display.util.js';
import { ErrorUtil } from '../utils/error.util.js';
import { UrlParser } from '../utils/url.util.js';
import type { MosesConfig } from '../types/moses-config.type.js';

export class GitlabDataProvider {
  static async fetchMrData(url: string, config: MosesConfig) {
    const parsedUrl = GitlabDataProvider.parseMergeRequestUrl(url);

    if (!parsedUrl) {
      return null;
    }

    const gitlabConfig = ConfigStore.findGitlabInstance(config, parsedUrl.host);

    if (!gitlabConfig) {
      DisplayUtil.error(`No GitLab instance configured for host: ${parsedUrl.host}`);
      return null;
    }

    return GitlabDataProvider.fetchAndDisplayMergeRequest(
      gitlabConfig.url,
      gitlabConfig.token,
      parsedUrl.projectId,
      parsedUrl.mrIid,
    );
  }

  private static parseMergeRequestUrl(url: string) {
    try {
      return UrlParser.parseMergeRequestUrl(url);
    } catch (error: unknown) {
      DisplayUtil.error(ErrorUtil.getMessage(error, 'Invalid Merge Request URL.'));
      return null;
    }
  }

  private static async fetchAndDisplayMergeRequest(
    baseUrl: string,
    token: string,
    projectId: string,
    mrIid: string,
  ) {
    const spinner = DisplayUtil.spinner('Fetching MR data...');
    try {
      const gitlab = new GitlabClient(baseUrl, token);
      const data = await gitlab.mergeRequests.getBundle(projectId, mrIid);
      spinner.stop();
      return data;
    } catch (error: unknown) {
      GitlabDataProvider.handleFetchError(error, spinner);
      return null;
    }
  }

  private static handleFetchError(error: unknown, spinner: { fail: (text: string) => void }): void {
    spinner.fail('Failed to fetch MR data.');

    if (HttpUtil.getStatus(error) === 404) {
      DisplayUtil.error('MR not found (404). Check URL and access (VPN, permissions).');
      return;
    }

    DisplayUtil.error(`Error: ${ErrorUtil.getMessage(error)}`);
  }
}

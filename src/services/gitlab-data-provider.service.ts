import axios from 'axios';
import dayjs from 'dayjs';
import { GitlabApiService } from './gitlab-api.service.js';
import { ConfigStore } from '../store/config.store.js';
import { Display } from '../utils/display.util.js';
import { UrlParser } from '../utils/url.util.js';
import type { MosesConfig } from '../types/moses-config.type.js';

export class GitlabDataProvider {
  static async fetchMrData(url: string, config: MosesConfig) {
    const parsedUrl = GitlabDataProvider.parseMergeRequestUrl(url);
    if (!parsedUrl) return null;
    const gitlabConfig = GitlabDataProvider.findGitlabConfig(config, parsedUrl.host);
    if (!gitlabConfig) {
      Display.error(`No GitLab instance configured for host: ${parsedUrl.host}`);
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
      Display.error(error instanceof Error ? error.message : 'Invalid Merge Request URL.');
      return null;
    }
  }

  private static findGitlabConfig(config: MosesConfig, host: string) {
    return ConfigStore.findGitlabInstance(config, host);
  }

  private static async fetchAndDisplayMergeRequest(
    baseUrl: string,
    token: string,
    projectId: string,
    mrIid: string,
  ) {
    const spinner = Display.spinner('Fetching MR data...');
    try {
      const data = await GitlabApiService.getMergeRequestData(baseUrl, token, projectId, mrIid);
      spinner.succeed(`MR #${data.mr.iid} — "${data.mr.title}" loaded`);
      GitlabDataProvider.displayMergeRequestSummary(data);
      return data;
    } catch (error: unknown) {
      GitlabDataProvider.handleFetchError(error, spinner);
      return null;
    }
  }

  private static displayMergeRequestSummary(
    data: Awaited<ReturnType<typeof GitlabApiService.getMergeRequestData>>,
  ): void {
    Display.info(`👤 Author:   ${data.mr.author?.name ?? data.mr.author?.username ?? 'unknown'}`);
    Display.info(`🌿 Branch:   ${data.mr.source_branch} → ${data.mr.target_branch}`);
    Display.info(`📅 Date:     ${dayjs(data.mr.created_at).format('YYYY-MM-DD')}`);
    Display.info(
      `📊 Stats:    ${data.diffs.length} files | changes_count: ${data.mr.changes_count ?? '?'}`,
    );
  }

  private static handleFetchError(error: unknown, spinner: { fail: (text: string) => void }): void {
    spinner.fail('Failed to fetch MR data.');
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      Display.error('MR not found (404). Check URL and access (VPN, permissions).');
      return;
    }
    Display.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

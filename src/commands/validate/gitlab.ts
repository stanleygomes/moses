import axios from 'axios';
import dayjs from 'dayjs';
import { GitlabService } from '../../services/gitlab.js';
import { ConfigStore } from '../../utils/config-store.js';
import { Display } from '../../utils/display.js';
import { UrlParser } from '../../utils/url-parser.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export class ValidateGitlabDataProvider {
  static async fetchMrData(url: string, config: MosesConfig) {
    let parsedUrl;
    try {
      parsedUrl = UrlParser.parseMergeRequestUrl(url);
    } catch (error: unknown) {
      Display.error(error instanceof Error ? error.message : 'Invalid Merge Request URL.');
      return null;
    }

    const gitlabConfig = ConfigStore.findGitlabInstance(config, parsedUrl.host);
    if (!gitlabConfig) {
      Display.error(`No GitLab instance configured for host: ${parsedUrl.host}`);
      return null;
    }

    const spinner = Display.spinner('Fetching MR data...');
    try {
      const data = await GitlabService.getMergeRequestData(
        gitlabConfig.url,
        gitlabConfig.token,
        parsedUrl.projectId,
        parsedUrl.mrIid,
      );
      spinner.succeed(`MR #${data.mr.iid} — "${data.mr.title}" loaded`);

      Display.info(`👤 Author:   ${data.mr.author?.name ?? data.mr.author?.username ?? 'unknown'}`);
      Display.info(`🌿 Branch:   ${data.mr.source_branch} → ${data.mr.target_branch}`);
      Display.info(`📅 Date:     ${dayjs(data.mr.created_at).format('YYYY-MM-DD')}`);
      Display.info(
        `📊 Stats:    ${data.diffs.length} files | changes_count: ${data.mr.changes_count ?? '?'}`,
      );

      return data;
    } catch (error: unknown) {
      spinner.fail('Failed to fetch MR data.');
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        Display.error('MR not found (404). Check URL and access (VPN, permissions).');
      } else {
        Display.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return null;
    }
  }
}

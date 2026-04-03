import axios from 'axios';
import dayjs from 'dayjs';
import { getMergeRequestData } from '../../services/gitlab.js';
import { findGitlabInstance } from '../../utils/config-store.js';
import * as display from '../../utils/display.js';
import { parseMergeRequestUrl } from '../../utils/url-parser.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export async function fetchMrData(url: string, config: MosesConfig) {
  let parsedUrl;
  try {
    parsedUrl = parseMergeRequestUrl(url);
  } catch (error: unknown) {
    display.error(error instanceof Error ? error.message : 'Invalid Merge Request URL.');
    return null;
  }

  const gitlabConfig = findGitlabInstance(config, parsedUrl.host);
  if (!gitlabConfig) {
    display.error(`No GitLab instance configured for host: ${parsedUrl.host}`);
    return null;
  }

  const spinner = display.spinner('Fetching MR data...');
  try {
    const data = await getMergeRequestData(
      gitlabConfig.url,
      gitlabConfig.token,
      parsedUrl.projectId,
      parsedUrl.mrIid,
    );
    spinner.succeed(`MR #${data.mr.iid} — "${data.mr.title}" loaded`);

    display.info(`👤 Author:   ${data.mr.author?.name ?? data.mr.author?.username ?? 'unknown'}`);
    display.info(`🌿 Branch:   ${data.mr.source_branch} → ${data.mr.target_branch}`);
    display.info(`📅 Date:     ${dayjs(data.mr.created_at).format('YYYY-MM-DD')}`);
    display.info(
      `📊 Stats:    ${data.diffs.length} files | changes_count: ${data.mr.changes_count ?? '?'}`,
    );

    return data;
  } catch (error: unknown) {
    spinner.fail('Failed to fetch MR data.');
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      display.error('MR not found (404). Check URL and access (VPN, permissions).');
    } else {
      display.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return null;
  }
}

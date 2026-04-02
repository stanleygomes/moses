import fs from 'node:fs/promises';
import path from 'node:path';
import dayjs from 'dayjs';
import { MESSAGES } from '../constants.js';
import { runAiReview } from '../services/ai-tools.js';
import { getMergeRequestData } from '../services/gitlab.js';
import { buildMergeRequestMarkdown } from '../services/markdown.js';
import { checkAndFixConfigPermissions, getOutputDir, readConfig } from '../utils/config-store.js';
import * as display from '../utils/display.js';
import { parseMergeRequestUrl } from '../utils/url-parser.js';

function findGitlabConfig(config, host) {
  const gitlabs = config.gitlabs ?? [];
  return (
    gitlabs.find((item) => {
      try {
        const urlHost = new URL(item.url).host;
        return urlHost === host;
      } catch {
        return false;
      }
    }) ?? gitlabs.find((item) => item.default) ?? null
  );
}

export async function runValidate(url) {
  display.banner();
  display.info(`🔗 Analyzing: ${url}`);

  let config;
  try {
    config = await readConfig();
    const permissionStatus = await checkAndFixConfigPermissions();
    if (permissionStatus.fixed) {
      display.warn('Config permissions were incorrect and have been fixed to 600.');
    }
  } catch {
    display.error(MESSAGES.noConfig);
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = parseMergeRequestUrl(url);
  } catch (error) {
    display.error(error.message);
    return;
  }

  const gitlabConfig = findGitlabConfig(config, parsedUrl.host);
  if (!gitlabConfig) {
    display.error(`No GitLab instance configured for host: ${parsedUrl.host}`);
    return;
  }

  const spinner = display.spinner('Fetching MR data...');
  let data;
  try {
    data = await getMergeRequestData(gitlabConfig.url, gitlabConfig.token, parsedUrl.projectId, parsedUrl.mrIid);
    spinner.succeed(`MR #${data.mr.iid} — "${data.mr.title}" loaded`);
  } catch (error) {
    spinner.fail('Failed to fetch MR data.');
    if (error?.response?.status === 404) {
      display.error('MR not found (404). Check URL and access (VPN, permissions).');
      return;
    }
    display.error(`Error: ${error.message}`);
    return;
  }

  display.info(`👤 Author:   ${data.mr.author?.name ?? data.mr.author?.username ?? 'unknown'}`);
  display.info(`🌿 Branch:   ${data.mr.source_branch} → ${data.mr.target_branch}`);
  display.info(`📅 Date:     ${dayjs(data.mr.created_at).format('YYYY-MM-DD')}`);
  display.info(`📊 Stats:    ${data.diffs.length} files | changes_count: ${data.mr.changes_count ?? '?'}`);

  const markdownSpinner = display.spinner('Generating diff markdown...');
  try {
    const markdown = buildMergeRequestMarkdown({
      mr: data.mr,
      diffs: data.diffs,
      commits: data.commits,
      url,
    });

    const outputDir = getOutputDir();
    await fs.mkdir(outputDir, { recursive: true });
    const fileName = `mr-${data.mr.iid}-${dayjs().format('YYYY-MM-DD')}.md`;
    const fullPath = path.join(outputDir, fileName);
    await fs.writeFile(fullPath, markdown, 'utf-8');
    markdownSpinner.succeed(`Diff saved at: ${fullPath}`);

    display.info('\n🤖 Starting review with AI tool...');
    display.info('────────────────────────────────────────────────────────');

    await new Promise((resolve, reject) => {
      runAiReview(config.ai?.tool ?? 'copilot', markdown, {
        onStdout: (chunk) => display.streamLine(chunk),
        onStderr: (chunk) => display.streamLine(chunk),
        onClose: (code) => {
          if (code === 0) resolve();
          else reject(new Error(`AI process exited with code ${code}`));
        },
        onError: reject,
      });
    });

    display.info('\n────────────────────────────────────────────────────────');
    display.success('Review completed!');
  } catch (error) {
    markdownSpinner.fail('Failed to generate markdown or run AI review.');
    display.error(error.message);
  }
}

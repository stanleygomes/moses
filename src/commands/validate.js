import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import dayjs from 'dayjs';
import { MESSAGES } from '../constants.js';
import { runAiReview } from '../services/ai-tools.js';
import { getMergeRequestData } from '../services/gitlab.js';
import { buildMergeRequestMarkdown } from '../services/markdown.js';
import { checkAndFixConfigPermissions, readConfig } from '../utils/config-store.js';
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

async function readContextFile(fileName) {
  const filePath = path.resolve(process.cwd(), 'src', 'context', fileName);
  return fs.readFile(filePath, 'utf-8');
}

function parseChangesCount(value) {
  if (typeof value === 'number') return value;
  const parsed = Number.parseInt(String(value ?? '').replace(/\D/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function notifyLinuxDone() {
  if (os.platform() !== 'linux') return;
  import('node:child_process')
    .then(({ spawn }) => {
      const child = spawn('notify-send', ['moses', 'Análise do MR finalizada.'], {
        stdio: 'ignore',
        detached: true,
      });
      child.unref();
    })
    .catch(() => {});
}

export async function runValidate(url, options = {}) {
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

  const markdownSpinner = display.spinner('Preparing prompt for AI analysis...');
  try {
    const markdown = buildMergeRequestMarkdown({
      mr: data.mr,
      diffs: data.diffs,
      commits: data.commits,
      url,
    });
    const changesCount = parseChangesCount(data.mr.changes_count);
    const maxChanges = Number(config.review?.maxChanges ?? 3000);
    if (changesCount !== null && Number.isFinite(maxChanges) && changesCount > maxChanges) {
      markdownSpinner.fail('Diff size exceeded configured limit.');
      display.error(`MR has ${changesCount} changes and the configured limit is ${maxChanges}.`);
      display.warn('Validation interrupted to avoid exceeding response/token limits.');
      return;
    }
    const [basePrompt, practicesPrompt] = await Promise.all([
      readContextFile('base-prompt.md'),
      readContextFile('mr-practices.md'),
    ]);
    markdownSpinner.succeed('Prompt assembled.');

    const feedbackStyle = config.review?.feedbackStyle ?? 'pragmatic';
    const userPrompt = options.prompt ?? '';
    const analysisSpinner = display.spinner(
      'Running AI analysis (a Linux system notification will be sent when it finishes)...',
    );
    await new Promise((resolve, reject) => {
      runAiReview(
        config.ai?.tool ?? 'copilot',
        {
          basePrompt,
          practicesPrompt,
          feedbackStyle,
          userPrompt,
          markdownContent: markdown,
        },
        {
          onStdout: (chunk) => display.streamLine(chunk),
          onStderr: (chunk) => display.streamLine(chunk),
          onClose: (code) => {
            if (code === 0) resolve();
            else reject(new Error(`AI process exited with code ${code}`));
          },
          onError: reject,
        },
      );
    });
    analysisSpinner.succeed('AI analysis completed.');
    notifyLinuxDone();
    display.success('Review completed!');
  } catch (error) {
    markdownSpinner.fail('Failed to prepare prompt or run AI review.');
    display.error(error.message);
  }
}

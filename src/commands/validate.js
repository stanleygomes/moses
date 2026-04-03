import dayjs from 'dayjs';
import { MESSAGES } from '../constants.js';
import { runAiReview } from '../services/ai-tools.js';
import { ensureDefaultContextFiles, readContextPrompt } from '../services/context.js';
import { getMergeRequestData } from '../services/gitlab.js';
import { buildMergeRequestMarkdown, countDiffChanges } from '../services/markdown.js';
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

  const maxDiffChanges = config.ai?.maxDiffChanges;
  const totalChanges = countDiffChanges(data.diffs);
  if (Number.isInteger(maxDiffChanges) && maxDiffChanges > 0 && totalChanges > maxDiffChanges) {
    display.warn(
      `Diff interrompido: total de changes (${totalChanges}) excede o limite configurado (${maxDiffChanges}). Atualize o limite com: moses set-diff-limit`,
    );
    return;
  }

  const markdownSpinner = display.spinner('Preparando contexto e diff...');
  try {
    await ensureDefaultContextFiles();
    const contextPrompt = await readContextPrompt(options.prompt ?? '');
    const markdown = buildMergeRequestMarkdown({
      mr: data.mr,
      diffs: data.diffs,
      commits: data.commits,
      url,
    });

    markdownSpinner.succeed('Contexto e diff preparados');

    const reviewSpinner = display.spinner('Aguardando análise da IA...');
    display.info('\n🤖 Starting review with AI tool...');
    display.info('────────────────────────────────────────────────────────');

    await new Promise((resolve, reject) => {
      runAiReview(config.ai?.tool ?? 'copilot', markdown, {
        options: {
          feedbackStyle: config.ai?.feedbackStyle,
          contextPrompt,
        },
        onStdout: (chunk) => display.streamLine(chunk),
        onStderr: (chunk) => display.streamLine(chunk),
        onClose: (code) => {
          if (code === 0) {
            reviewSpinner.succeed('Análise concluída');
            resolve();
          } else {
            reviewSpinner.fail('Falha na análise da IA');
            reject(new Error(`AI process exited with code ${code}`));
          }
        },
        onError: (error) => {
          reviewSpinner.fail('Falha na análise da IA');
          reject(error);
        },
      });
    });

    display.info('\n────────────────────────────────────────────────────────');
    display.success('Review completed!');
  } catch (error) {
    markdownSpinner.fail('Failed to generate markdown or run AI review.');
    display.error(error.message);
  }
}

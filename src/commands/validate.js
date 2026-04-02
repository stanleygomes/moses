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
  display.info(`🔗 Analisando: ${url}`);

  let config;
  try {
    config = await readConfig();
    const permissionStatus = await checkAndFixConfigPermissions();
    if (permissionStatus.fixed) {
      display.warn('Permissões do config estavam incorretas e foram corrigidas para 600.');
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
    display.error(`Nenhuma instância GitLab configurada para host: ${parsedUrl.host}`);
    return;
  }

  const spinner = display.spinner('Buscando dados do MR...');
  let data;
  try {
    data = await getMergeRequestData(gitlabConfig.url, gitlabConfig.token, parsedUrl.projectId, parsedUrl.mrIid);
    spinner.succeed(`MR #${data.mr.iid} — "${data.mr.title}" carregado`);
  } catch (error) {
    spinner.fail('Falha ao buscar dados do MR.');
    if (error?.response?.status === 404) {
      display.error('MR não encontrado (404). Verifique URL e acesso (VPN, permissões).');
      return;
    }
    display.error(`Erro: ${error.message}`);
    return;
  }

  display.info(`👤 Autor:    ${data.mr.author?.name ?? data.mr.author?.username ?? 'desconhecido'}`);
  display.info(`🌿 Branch:   ${data.mr.source_branch} → ${data.mr.target_branch}`);
  display.info(`📅 Data:     ${dayjs(data.mr.created_at).format('YYYY-MM-DD')}`);
  display.info(`📊 Stats:    ${data.diffs.length} arquivos | changes_count: ${data.mr.changes_count ?? '?'}`);

  const markdownSpinner = display.spinner('Gerando markdown do diff...');
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
    markdownSpinner.succeed(`Diff salvo em: ${fullPath}`);

    display.info('\n🤖 Iniciando revisão com ferramenta de IA...');
    display.info('────────────────────────────────────────────────────────');

    await new Promise((resolve, reject) => {
      runAiReview(config.ai?.tool ?? 'copilot', markdown, {
        onStdout: (chunk) => display.streamLine(chunk),
        onStderr: (chunk) => display.streamLine(chunk),
        onClose: (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Processo de IA encerrou com código ${code}`));
        },
        onError: reject,
      });
    });

    display.info('\n────────────────────────────────────────────────────────');
    display.success('Revisão concluída!');
  } catch (error) {
    markdownSpinner.fail('Falha ao gerar markdown ou executar revisão de IA.');
    display.error(error.message);
  }
}

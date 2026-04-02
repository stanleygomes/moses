import { confirm, input, password, select } from '@inquirer/prompts';
import { AI_TOOLS, CONFIG_VERSION, MESSAGES } from '../constants.js';
import { validateToken } from '../services/gitlab.js';
import { checkAndFixConfigPermissions, getConfigPath, readConfig, saveConfig } from '../utils/config-store.js';
import * as display from '../utils/display.js';
import { validateToolInstallation } from '../utils/tool-validator.js';
import { validateGitlabUrl } from '../utils/url-parser.js';

async function chooseGitlabBaseUrl() {
  const gitlabType = await select({
    message: 'Qual GitLab você deseja usar?',
    choices: [
      { name: 'GitLab.com (gitlab.com) — Padrão', value: 'default' },
      { name: 'GitLab Self-Hosted (informe a URL customizada)', value: 'self' },
    ],
  });

  if (gitlabType === 'default') {
    return 'https://gitlab.com';
  }

  while (true) {
    const url = await input({ message: 'URL do GitLab:', default: 'https://gitlab.seu-dominio.com' });
    if (validateGitlabUrl(url)) return url;
    display.error('URL inválida. Use https:// e um domínio válido.');
  }
}

async function chooseAiTool() {
  while (true) {
    const chosen = await select({
      message: 'Escolha a ferramenta de IA para revisão:',
      choices: AI_TOOLS.map((tool) => ({ name: tool.name, value: tool.key })),
    });

    const toolInfo = AI_TOOLS.find((tool) => tool.key === chosen);
    const toolSpinner = display.spinner(`Verificando instalação do ${toolInfo.name}...`);
    const validation = validateToolInstallation(chosen);
    toolSpinner.stop();

    if (validation.installed) {
      display.success(`${toolInfo.name} encontrado em ${validation.path}`);
      return chosen;
    }

    display.error(`${toolInfo.name} não encontrado!`);
    display.info(`\n📦 Instale com:\n   ${validation.installCmd}`);
    display.info(`\n📖 Documentação: ${validation.installUrl}\n`);
    const retry = await confirm({ message: 'Deseja escolher outra ferramenta?', default: true });
    if (!retry) {
      throw new Error('Ferramenta de IA não instalada. Instale uma ferramenta suportada e rode novamente.');
    }
  }
}

export async function runInit() {
  display.banner();
  display.info(MESSAGES.welcome);

  let existingConfig = null;
  try {
    existingConfig = await readConfig();
    const permissionStatus = await checkAndFixConfigPermissions();
    if (permissionStatus.fixed) {
      display.warn(`Permissões corrigidas automaticamente para 600 em ${getConfigPath()}`);
    }
  } catch {}

  if (existingConfig) {
    const overwrite = await confirm({
      message: 'Configuração existente encontrada. Deseja sobrescrever/adicionar nova instância?',
      default: true,
    });
    if (!overwrite) {
      display.info('Nenhuma alteração aplicada.');
      return;
    }
  }

  display.section('📋 CONFIGURAÇÃO DO GITLAB');

  const gitlabName = await input({
    message: 'Nome desta instância:',
    default: existingConfig?.defaultGitlab ?? 'gitlab-main',
  });
  const gitlabUrl = await chooseGitlabBaseUrl();
  const token = await password({
    message: 'Personal Access Token (scope: api):',
    mask: '*',
  });

  const tokenSpinner = display.spinner('Validando token...');
  let user;
  try {
    user = await validateToken(gitlabUrl, token);
    tokenSpinner.succeed(`Token válido! Usuário: @${user.username}`);
  } catch (error) {
    tokenSpinner.fail('Token inválido ou expirado.');
    display.info('Veja: https://docs.gitlab.com/user/profile/personal_access_tokens/');
    throw error;
  }

  display.section('🤖 CONFIGURAÇÃO DA FERRAMENTA DE IA');
  const aiTool = await chooseAiTool();

  const baseConfig = existingConfig ?? {
    version: CONFIG_VERSION,
    defaultGitlab: gitlabName,
    gitlabs: [],
    ai: { tool: aiTool, customCommand: null, model: null },
    output: { dir: '~/.config/moses/reviews', keepFiles: true },
  };

  const remainingGitlabs = (baseConfig.gitlabs ?? []).filter((item) => item.name !== gitlabName);
  const gitlabs = [
    ...remainingGitlabs,
    {
      name: gitlabName,
      url: gitlabUrl,
      token,
      default: true,
    },
  ].map((item) => ({ ...item, default: item.name === gitlabName }));

  const config = {
    ...baseConfig,
    version: CONFIG_VERSION,
    defaultGitlab: gitlabName,
    gitlabs,
    ai: {
      ...(baseConfig.ai ?? {}),
      tool: aiTool,
      customCommand: null,
      model: null,
    },
  };

  const configPath = await saveConfig(config);

  display.success(MESSAGES.done);
  display.info(`📁 Config salva em ${configPath} (modo 600)`);
  display.info(MESSAGES.next);
}

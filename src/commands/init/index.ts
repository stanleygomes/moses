import { confirm, input, password } from '@inquirer/prompts';
import { CONFIG_VERSION, DEFAULT_OUTPUT_DIR, MESSAGES } from '../../constants.js';
import { ensureDefaultContextFiles } from '../../services/context.js';
import {
  checkAndFixConfigPermissions,
  getConfigPath,
  readConfig,
  saveConfig,
} from '../../utils/config-store.js';
import * as display from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';
import { chooseAiTool, chooseFeedbackStyle, chooseMaxDiffChanges } from './ai-wizard.js';
import { chooseGitlabBaseUrl, validateGitlabToken } from './gitlab-wizard.js';

export async function runInit(): Promise<void> {
  display.banner();
  display.info(MESSAGES.welcome);

  let existingConfig: MosesConfig | null = null;
  try {
    existingConfig = await readConfig();
    const permissionStatus = await checkAndFixConfigPermissions();
    if (permissionStatus.fixed) {
      display.warn(`Permissions were automatically fixed to 600 at ${getConfigPath()}`);
    }
  } catch {
    // config not found yet
  }

  if (existingConfig) {
    const overwrite = await confirm({
      message: 'Existing configuration found. Do you want to overwrite/add a new instance?',
      default: true,
    });
    if (!overwrite) {
      display.info('No changes applied.');
      return;
    }
  }

  display.section('📋 GITLAB CONFIGURATION');

  const gitlabName = await input({
    message: 'Instance name:',
    default: existingConfig?.defaultGitlab ?? 'gitlab-main',
  });
  const gitlabUrl = await chooseGitlabBaseUrl();
  const token = await password({
    message: 'Personal Access Token (scope: api):',
    mask: '*',
  });

  await validateGitlabToken(gitlabUrl, token);

  display.section('🤖 AI TOOL CONFIGURATION');
  const aiTool = await chooseAiTool();
  const feedbackStyle = await chooseFeedbackStyle(existingConfig?.ai?.feedbackStyle);
  const maxDiffChanges = await chooseMaxDiffChanges(existingConfig?.ai?.maxDiffChanges);

  const baseConfig: MosesConfig = existingConfig ?? {
    version: CONFIG_VERSION,
    defaultGitlab: gitlabName,
    gitlabs: [],
    ai: {
      tool: aiTool,
      customCommand: null,
      model: null,
      feedbackStyle,
      maxDiffChanges,
    },
    output: { dir: DEFAULT_OUTPUT_DIR, keepFiles: true },
  };

  const remainingGitlabs = baseConfig.gitlabs.filter((item) => item.name !== gitlabName);
  const gitlabs = [
    ...remainingGitlabs,
    { name: gitlabName, url: gitlabUrl, token, default: true },
  ].map((item) => ({
    ...item,
    default: item.name === gitlabName,
  }));

  const config: MosesConfig = {
    ...baseConfig,
    version: CONFIG_VERSION,
    defaultGitlab: gitlabName,
    gitlabs,
    ai: {
      ...baseConfig.ai,
      tool: aiTool,
      customCommand: null,
      model: null,
      feedbackStyle,
      maxDiffChanges,
    },
  };

  const configPath = await saveConfig(config);
  await ensureDefaultContextFiles();

  display.success(MESSAGES.done);
  display.info(`📁 Config saved at ${configPath} (mode 600)`);
  display.info(MESSAGES.next);
}

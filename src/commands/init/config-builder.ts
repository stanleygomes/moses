import { CONFIG_VERSION, DEFAULT_OUTPUT_DIR } from '../../constants.js';
import { ContextService } from '../../services/context.js';
import { ConfigStore } from '../../utils/config-store.js';
import type { MosesConfig } from '../../types/MosesConfig.js';
import type { GitlabSetupData } from './gitlab-wizard.js';
import type { AiSetupData } from './ai-wizard.js';

export class InitConfigBuilder {
  static async buildAndSaveConfig(
    gitlab: GitlabSetupData,
    ai: AiSetupData,
    existing: MosesConfig | null,
  ): Promise<{ configPath: string; contextInfo: { contextDir: string; files: string[] } }> {
    const baseConfig: MosesConfig = existing ?? {
      version: CONFIG_VERSION,
      defaultGitlab: gitlab.name,
      gitlabs: [],
      ai: {
        tool: ai.tool,
        customCommand: null,
        model: null,
        feedbackStyle: ai.feedbackStyle,
        maxDiffChanges: ai.maxDiffChanges,
      },
      output: { dir: DEFAULT_OUTPUT_DIR, keepFiles: true },
    };

    const remainingGitlabs = baseConfig.gitlabs.filter((item) => item.name !== gitlab.name);
    const gitlabs = [
      ...remainingGitlabs,
      { name: gitlab.name, url: gitlab.url, token: gitlab.token, default: true },
    ].map((item) => ({
      ...item,
      default: item.name === gitlab.name,
    }));

    const config: MosesConfig = {
      ...baseConfig,
      version: CONFIG_VERSION,
      defaultGitlab: gitlab.name,
      gitlabs,
      ai: {
        ...baseConfig.ai,
        tool: ai.tool,
        customCommand: null,
        model: null,
        feedbackStyle: ai.feedbackStyle,
        maxDiffChanges: ai.maxDiffChanges,
      },
    };

    const configPath = await ConfigStore.saveConfig(config);
    const contextInfo = await ContextService.ensureDefaultContextFiles();
    return { configPath, contextInfo };
  }
}

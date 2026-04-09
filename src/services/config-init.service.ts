import { CONFIG_VERSION } from '../constants/app.constant.js';
import { DEFAULT_OUTPUT_DIR } from '../constants/paths.constant.js';
import type { MosesConfig } from '../types/moses-config.type.js';
import type { GitlabSetupData } from '../types/gitlab-setup-data.type.js';
import type { AiSetupData } from './ai-setup.service.js';

export class ConfigInitService {
  static build(
    gitlab: GitlabSetupData,
    ai: AiSetupData,
    existing: MosesConfig | null,
  ): MosesConfig {
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

    return {
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
  }
}

import { ConfigStore } from '../../../store/config.store.js';
import { Display } from '../../../utils/display.util.js';
import { Prompt } from '../../../utils/prompt.util.js';
import type { MosesConfig } from '../../../types/moses-config.type.js';

export class GitlabSwitchHandler {
  static displayNoInstances(): void {
    Display.warn('No GitLab instances configured.');
  }

  static async promptAndSwitch(config: MosesConfig): Promise<void> {
    const choices = config.gitlabs.map((gitlab) => ({
      name: `${gitlab.name} (${gitlab.url})`,
      value: gitlab.name,
    }));

    const nextDefault = await Prompt.select<string>({
      message: 'Choose the default GitLab instance:',
      choices,
      default: config.defaultGitlab,
    });

    await this.updateConfig(config, nextDefault);
  }

  static async updateConfig(config: MosesConfig, nextDefault: string): Promise<void> {
    const updatedGitlabs = config.gitlabs.map((gitlab) => ({
      ...gitlab,
      default: gitlab.name === nextDefault,
    }));

    const nextConfig: MosesConfig = {
      ...config,
      defaultGitlab: nextDefault,
      gitlabs: updatedGitlabs,
    };

    await ConfigStore.set(nextConfig);
    Display.success(`Default GitLab switched to: ${nextDefault}`);
  }

  static handleError(error: unknown): void {
    Display.error('Could not switch GitLab instance.');
    console.log(error);
  }
}

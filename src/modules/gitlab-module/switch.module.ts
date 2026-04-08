import { select } from '@inquirer/prompts';
import type { MosesConfig } from '../../types/moses-config.type.js';
import { ConfigStore } from '../../store/config.store.js';
import { Display } from '../../utils/display.util.js';

export class GitlabSwitchModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();

      if (!config || config.gitlabs.length === 0) {
        this.displayNoInstances();
        return;
      }

      await this.promptAndSwitch(config);
    } catch (error) {
      this.handleError(error);
    }
  }

  private static displayNoInstances(): void {
    Display.warn('No GitLab instances configured.');
  }

  private static async promptAndSwitch(config: MosesConfig): Promise<void> {
    const choices = config.gitlabs.map((gitlab) => ({
      name: `${gitlab.name} (${gitlab.url})`,
      value: gitlab.name,
    }));

    const nextDefault = await select({
      message: 'Choose the default GitLab instance:',
      choices,
      default: config.defaultGitlab,
    });

    await this.updateConfig(config, nextDefault);
  }

  private static async updateConfig(config: MosesConfig, nextDefault: string): Promise<void> {
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

  private static handleError(error: unknown): void {
    Display.error('Could not switch GitLab instance.');
    console.log(error);
  }
}

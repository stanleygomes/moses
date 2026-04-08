import { ConfigStore } from '../store/config.store.js';
import { Display } from '../utils/display.util.js';
import { Prompt } from '../utils/prompt.util.js';
import type { MosesConfig } from '../types/moses-config.type.js';
import type { GitlabInstance } from '../types/gitlab-instance.type.js';

export class GitlabInstanceManager {
  static displayNoInstances(): void {
    Display.warn('No GitLab instances configured.');
    Display.info('Run "moses init" to add a new instance.');
  }

  static displayInstances(config: MosesConfig): void {
    Display.section('📋 CONFIGURED GITLAB INSTANCES');

    config.gitlabs.forEach((gitlab) => {
      this.displayInstanceDetails(gitlab, gitlab.name === config.defaultGitlab);
    });

    Display.info('TIP: You can use "moses gitlab default" to change the default instance.');
  }

  private static displayInstanceDetails(gitlab: GitlabInstance, isDefault: boolean): void {
    const indicator = isDefault ? '⭐️ ' : '🔹 ';
    const label = isDefault ? ' (DEFAULT)' : '';

    Display.info(`${indicator}${gitlab.name}${label}`);
    Display.info(`   URL: ${gitlab.url}`);
    Display.info(
      `   Token: ${gitlab.token.replace(/./g, '*').substring(0, 10)}... (last 4 chars: ${gitlab.token.slice(-4)})`,
    );

    console.log('');
  }

  static async promptAndSwitch(config: MosesConfig): Promise<void> {
    if (!config.gitlabs.length) {
      this.displayNoInstances();
      return;
    }

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

  static handleLoadError(error: unknown): void {
    Display.error('Could not load Moses configuration.');
    Display.info('Run "moses init" if you haven\'t yet.');
    console.log(error);
  }

  static handleSwitchError(error: unknown): void {
    Display.error('Could not switch GitLab instance.');
    console.log(error);
  }
}

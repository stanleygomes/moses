import { Display } from '../utils/display.util.js';
import { Prompt } from '../utils/prompt.util.js';
import { ConfigUtil } from '../utils/config.util.js';
import { ErrorUtil } from '../utils/error.util.js';
import { TokenUtil } from '../utils/token.util.js';
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
      GitlabInstanceManager.displayInstanceDetails(gitlab, gitlab.name === config.defaultGitlab);
    });

    Display.info('TIP: You can use "moses gitlab default" to change the default instance.');
  }

  private static displayInstanceDetails(gitlab: GitlabInstance, isDefault: boolean): void {
    const indicator = isDefault ? '⭐️ ' : '🔹 ';
    const label = isDefault ? ' (DEFAULT)' : '';

    Display.info(`${indicator}${gitlab.name}${label}`);
    Display.info(`   URL: ${gitlab.url}`);
    Display.info(`   Token: ${TokenUtil.mask(gitlab.token)}`);

    console.log('');
  }

  static async promptAndSwitch(config: MosesConfig): Promise<void> {
    if (!config.gitlabs.length) {
      this.displayNoInstances();
      return;
    }

    const choices = GitlabInstanceManager.buildInstanceChoices(config);
    const nextDefault = await Prompt.select<string>({
      message: 'Choose the default GitLab instance:',
      choices,
      default: config.defaultGitlab,
    });

    await this.updateConfig(config, nextDefault);
  }

  static async updateConfig(config: MosesConfig, nextDefault: string): Promise<void> {
    await ConfigUtil.updateAndSave(config, (current) => ({
      ...current,
      defaultGitlab: nextDefault,
      gitlabs: GitlabInstanceManager.markDefaultGitlab(current.gitlabs, nextDefault),
    }));
    Display.success(`Default GitLab switched to: ${nextDefault}`);
  }

  static handleLoadError(error: unknown): void {
    Display.error('Could not load Moses configuration.');
    Display.info('Run "moses init" if you haven\'t yet.');
    Display.error(ErrorUtil.getMessage(error));

    if (!(error instanceof Error && (error as { code?: string }).code === 'ENOENT')) {
      console.log(error);
    }
  }

  static handleSwitchError(error: unknown): void {
    Display.error('Could not switch GitLab instance.');
    Display.error(ErrorUtil.getMessage(error));

    if (error instanceof Error && (error as { code?: string }).code === 'ENOENT') {
      Display.info('Run "moses init" to create a configuration first.');
    } else {
      console.log(error);
    }
  }

  private static buildInstanceChoices(config: MosesConfig): { name: string; value: string }[] {
    return config.gitlabs.map((gitlab) => ({
      name: `${gitlab.name} (${gitlab.url})`,
      value: gitlab.name,
    }));
  }

  private static markDefaultGitlab(
    gitlabs: GitlabInstance[],
    nextDefault: string,
  ): GitlabInstance[] {
    return gitlabs.map((gitlab) => ({
      ...gitlab,
      default: gitlab.name === nextDefault,
    }));
  }
}

import { select } from '@inquirer/prompts';
import { ConfigStore } from '../../utils/config-store.js';
import { Display } from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export class SwitchGitlabCommand {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.readConfig();

      if (!config || config.gitlabs.length === 0) {
        Display.warn('No GitLab instances configured.');
        return;
      }

      const choices = config.gitlabs.map((gitlab) => ({
        name: `${gitlab.name} (${gitlab.url})`,
        value: gitlab.name,
      }));

      const nextDefault = await select({
        message: 'Choose the default GitLab instance:',
        choices,
        default: config.defaultGitlab,
      });

      const updatedGitlabs = config.gitlabs.map((gitlab) => ({
        ...gitlab,
        default: gitlab.name === nextDefault,
      }));

      const nextConfig: MosesConfig = {
        ...config,
        defaultGitlab: nextDefault,
        gitlabs: updatedGitlabs,
      };

      await ConfigStore.saveConfig(nextConfig);
      Display.success(`Default GitLab switched to: ${nextDefault}`);
    } catch (error) {
      Display.error('Could not switch GitLab instance.');
      console.log(error);
    }
  }
}

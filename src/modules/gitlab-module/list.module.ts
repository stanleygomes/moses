import { ConfigStore } from '../../store/config.store.js';
import { Display } from '../../utils/display.util.js';
import type { MosesConfig } from '../../types/moses-config.type.js';
import type { GitlabInstance } from '../../types/gitlab-instance.type.js';

export class GitlabListModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();

      if (!config || config.gitlabs.length === 0) {
        this.displayNoInstances();
        return;
      }

      this.displayInstances(config);
    } catch (error) {
      this.handleError(error);
    }
  }

  private static displayNoInstances(): void {
    Display.warn('No GitLab instances configured.');
    Display.info('Run "moses init" to add a new instance.');
  }

  private static displayInstances(config: MosesConfig): void {
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

  private static handleError(error: unknown): void {
    Display.error('Could not load Moses configuration.');
    Display.info('Run "moses init" if you haven\'t yet.');

    console.log(error);
  }
}

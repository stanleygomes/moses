import { ConfigStore } from '../../utils/config-store.js';
import { Display } from '../../utils/display.js';

export class ListGitlabsCommand {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.readConfig();

      if (!config || config.gitlabs.length === 0) {
        Display.warn('No GitLab instances configured.');
        Display.info('Run "moses init" to add a new instance.');
        return;
      }

      Display.section('📋 CONFIGURED GITLAB INSTANCES');

      config.gitlabs.forEach((gitlab) => {
        const isDefault = gitlab.name === config.defaultGitlab;
        const indicator = isDefault ? '⭐️ ' : '🔹 ';
        const label = isDefault ? ` (DEFAULT)` : '';

        Display.info(`${indicator}${gitlab.name}${label}`);
        Display.info(`   URL: ${gitlab.url}`);
        Display.info(
          `   Token: ${gitlab.token.replace(/./g, '*').substring(0, 10)}... (last 4 chars: ${gitlab.token.slice(-4)})`,
        );
        console.log('');
      });

      Display.info(`TIP: You can use "moses gitlab default" to change the default instance.`);
    } catch (error) {
      Display.error('Could not load Moses configuration.');
      Display.info('Run "moses init" if you haven\'t yet.');
      console.log(error);
    }
  }
}

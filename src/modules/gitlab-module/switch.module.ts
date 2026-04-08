import { ConfigStore } from '../../store/config.store.js';
import { Display } from '../../utils/display.util.js';
import { GitlabSwitchHandler } from './helpers/gitlab-switch.handler.js';

export class GitlabSwitchModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();

      if (!config || config.gitlabs.length === 0) {
        GitlabSwitchHandler.displayNoInstances();
        return;
      }

      await GitlabSwitchHandler.promptAndSwitch(config);
    } catch (error) {
      GitlabSwitchHandler.handleError(error);
    }
  }
}

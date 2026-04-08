import { ConfigStore } from '../store/config.store.js';
import { Display } from '../utils/display.util.js';
import { GitlabInstanceManager } from '../services/gitlab-instance-manager.service.js';

export class GitlabSwitchModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();

      if (!config || config.gitlabs.length === 0) {
        GitlabInstanceManager.displayNoInstances();
        return;
      }

      await GitlabInstanceManager.promptAndSwitch(config);
    } catch (error) {
      GitlabInstanceManager.handleSwitchError(error);
    }
  }
}

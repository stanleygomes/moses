import { ConfigStore } from '../store/config.store.js';
import { Display } from '../utils/display.util.js';
import { GitlabInstanceManager } from '../services/gitlab-instance-manager.service.js';

export class GitlabListModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();

      if (!config || config.gitlabs.length === 0) {
        GitlabInstanceManager.displayNoInstances();
        return;
      }

      GitlabInstanceManager.displayInstances(config);
    } catch (error) {
      GitlabInstanceManager.handleLoadError(error);
    }
  }
}

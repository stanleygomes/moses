import { ConfigStore } from '../../store/config.store.js';
import { Display } from '../../utils/display.util.js';
import { GitlabListHandler } from './helpers/gitlab-list.handler.js';

export class GitlabListModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();

      if (!config || config.gitlabs.length === 0) {
        GitlabListHandler.displayNoInstances();
        return;
      }

      GitlabListHandler.displayInstances(config);
    } catch (error) {
      GitlabListHandler.handleError(error);
    }
  }
}

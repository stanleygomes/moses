import { ConfigStore } from '../store/config.store.js';
import { Display } from '../utils/display.util.js';
import { DiffLimitManager } from '../services/diff-limit-manager.service.js';

export class SetDiffLimitModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();
      const limit = await DiffLimitManager.promptForLimit(config.ai?.maxDiffChanges);

      await DiffLimitManager.updateAndSave(config, limit);
    } catch (error) {
      DiffLimitManager.handleError(error);
    }
  }
}

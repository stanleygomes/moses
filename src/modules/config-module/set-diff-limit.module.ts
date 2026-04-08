import { ConfigStore } from '../../store/config.store.js';
import { Display } from '../../utils/display.util.js';
import { DiffLimitHandler } from './helpers/diff-limit.handler.js';

export class SetDiffLimitModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();
      const limit = await DiffLimitHandler.promptForLimit(config.ai?.maxDiffChanges);

      await DiffLimitHandler.updateAndSave(config, limit);
    } catch (error) {
      DiffLimitHandler.handleError(error);
    }
  }
}

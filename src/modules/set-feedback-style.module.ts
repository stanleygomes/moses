import { ConfigStore } from '../store/config.store.js';
import { Display } from '../utils/display.util.js';
import { FeedbackStyleManager } from '../services/feedback-style-manager.service.js';

export class SetFeedbackStyleModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();
      const style = await FeedbackStyleManager.promptForStyle(config.ai?.feedbackStyle);

      await FeedbackStyleManager.updateAndSave(config, style);
    } catch (error) {
      FeedbackStyleManager.handleError(error);
    }
  }
}

import { ConfigStore } from '../../store/config.store.js';
import { Display } from '../../utils/display.util.js';
import { FeedbackStyleHandler } from './helpers/feedback-style.handler.js';

export class SetFeedbackStyleModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();
      const style = await FeedbackStyleHandler.promptForStyle(config.ai?.feedbackStyle);

      await FeedbackStyleHandler.updateAndSave(config, style);
    } catch (error) {
      FeedbackStyleHandler.handleError(error);
    }
  }
}

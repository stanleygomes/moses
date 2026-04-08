import { Display } from '../utils/display.util.js';
import { ConfigUtil } from '../utils/config.util.js';
import { ErrorUtil } from '../utils/error.util.js';
import { FeedbackStyleUtil } from '../utils/feedback-style.util.js';
import type { FeedbackStyle } from '../types/feedback-style.type.js';
import type { MosesConfig } from '../types/moses-config.type.js';

export class FeedbackStyleManager {
  static async promptForStyle(currentStyle?: FeedbackStyle): Promise<FeedbackStyle> {
    return FeedbackStyleUtil.promptSelection(currentStyle);
  }

  static async updateAndSave(config: MosesConfig, style: FeedbackStyle): Promise<void> {
    await ConfigUtil.updateAiAndSave(config, { feedbackStyle: style });
    Display.success('Feedback style updated successfully.');
  }

  static handleError(error: unknown): void {
    Display.error('Could not update feedback style.');
    Display.error(ErrorUtil.getMessage(error));

    if (!(error instanceof Error && (error as { code?: string }).code === 'ENOENT')) {
      console.log(error);
    }
  }
}

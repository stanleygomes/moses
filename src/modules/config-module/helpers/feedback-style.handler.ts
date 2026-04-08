import { FEEDBACK_STYLES } from '../../../constants/feedback.constant.js';
import { ConfigStore } from '../../../store/config.store.js';
import { Display } from '../../../utils/display.util.js';
import { Prompt } from '../../../utils/prompt.util.js';
import type { FeedbackStyle } from '../../../types/feedback-style.type.js';
import type { MosesConfig } from '../../../types/moses-config.type.js';

export class FeedbackStyleHandler {
  static async promptForStyle(currentStyle?: FeedbackStyle): Promise<FeedbackStyle> {
    return Prompt.select<FeedbackStyle>({
      message: 'Choose MR feedback style:',
      choices: FEEDBACK_STYLES.map((item) => ({ name: item.label, value: item.key })),
      default:
        FEEDBACK_STYLES.find((item) => item.key === currentStyle)?.key ?? FEEDBACK_STYLES[1].key,
    });
  }

  static async updateAndSave(config: MosesConfig, style: FeedbackStyle): Promise<void> {
    const nextConfig: MosesConfig = {
      ...config,
      ai: {
        ...config.ai,
        feedbackStyle: style,
      },
    };

    await ConfigStore.set(nextConfig);
    Display.success('Feedback style updated successfully.');
  }

  static handleError(error: unknown): void {
    Display.error('Could not update feedback style.');
    console.log(error);
  }
}

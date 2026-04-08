import { FEEDBACK_STYLES } from '../../constants/feedback.constant.js';
import { ConfigStore } from '../../store/config.store.js';
import { Display } from '../../utils/display.util.js';
import { Prompt } from '../../utils/prompt.util.js';
import type { FeedbackStyle } from '../../types/feedback-style.type.js';
import type { MosesConfig } from '../../types/moses-config.type.js';

export class SetFeedbackStyleModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();
      const style = await this.promptForStyle(config.ai?.feedbackStyle);

      await this.updateAndSave(config, style);
    } catch (error) {
      this.handleError(error);
    }
  }

  private static async promptForStyle(currentStyle?: FeedbackStyle): Promise<FeedbackStyle> {
    return Prompt.select<FeedbackStyle>({
      message: 'Choose MR feedback style:',
      choices: FEEDBACK_STYLES.map((item) => ({ name: item.label, value: item.key })),
      default:
        FEEDBACK_STYLES.find((item) => item.key === currentStyle)?.key ?? FEEDBACK_STYLES[1].key,
    });
  }

  private static async updateAndSave(config: MosesConfig, style: FeedbackStyle): Promise<void> {
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

  private static handleError(error: unknown): void {
    Display.error('Could not update feedback style.');
    console.log(error);
  }
}

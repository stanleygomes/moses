import { select } from '@inquirer/prompts';
import { FEEDBACK_STYLES } from '../../constants/feedback.constant.js';
import { ConfigStore } from '../../utils/config-store.js';
import { Display } from '../../utils/display.js';
import type { FeedbackStyle } from '../../types/FeedbackStyle.js';
import type { MosesConfig } from '../../types/MosesConfig.js';
import { UpdateConfigLoader } from './load-config.js';

export class SetFeedbackStyleCommand {
  static async run(): Promise<void> {
    Display.banner();
    const config = await UpdateConfigLoader.loadConfigOrExit();
    if (!config) return;

    const current = config.ai?.feedbackStyle;
    const style: FeedbackStyle = await select({
      message: 'Choose MR feedback style:',
      choices: FEEDBACK_STYLES.map((item) => ({ name: item.label, value: item.key })),
      default: FEEDBACK_STYLES.find((item) => item.key === current)?.key ?? FEEDBACK_STYLES[1].key,
    });

    const nextConfig: MosesConfig = {
      ...config,
      ai: {
        ...config.ai,
        feedbackStyle: style,
      },
    };

    await ConfigStore.saveConfig(nextConfig);
    Display.success('Feedback style updated successfully.');
  }
}

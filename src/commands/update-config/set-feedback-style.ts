import { select } from '@inquirer/prompts';
import { FEEDBACK_STYLES } from '../../constants.js';
import { saveConfig } from '../../utils/config-store.js';
import * as display from '../../utils/display.js';
import type { FeedbackStyle } from '../../types/FeedbackStyle.js';
import type { MosesConfig } from '../../types/MosesConfig.js';
import { loadConfigOrExit } from './load-config.js';

export async function runSetFeedbackStyle(): Promise<void> {
  display.banner();
  const config = await loadConfigOrExit();
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

  await saveConfig(nextConfig);
  display.success('Feedback style updated successfully.');
}

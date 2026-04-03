import { input, select } from '@inquirer/prompts';
import { DEFAULT_MAX_DIFF_CHANGES, FEEDBACK_STYLES, MESSAGES } from '../constants.js';
import { checkAndFixConfigPermissions, readConfig, saveConfig } from '../utils/config-store.js';
import * as display from '../utils/display.js';
import type { FeedbackStyle, MosesConfig } from '../types.js';

async function loadConfigOrExit(): Promise<MosesConfig | null> {
  try {
    const config = await readConfig();
    const permissionStatus = await checkAndFixConfigPermissions();
    if (permissionStatus.fixed) {
      display.warn('Config permissions were incorrect and have been fixed to 600.');
    }
    return config;
  } catch {
    display.error(MESSAGES.noConfig);
    return null;
  }
}

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

export async function runSetDiffLimit(): Promise<void> {
  display.banner();
  const config = await loadConfigOrExit();
  if (!config) return;

  const current = config.ai?.maxDiffChanges;
  const fallback = Number.isInteger(current) && current > 0 ? current : DEFAULT_MAX_DIFF_CHANGES;

  while (true) {
    const value = await input({
      message: 'Maximum allowed diff changes before interrupting validation:',
      default: String(fallback),
    });
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      display.error('Invalid value. Please inform a positive integer.');
      continue;
    }

    const nextConfig: MosesConfig = {
      ...config,
      ai: {
        ...config.ai,
        maxDiffChanges: parsed,
      },
    };
    await saveConfig(nextConfig);
    display.success(`Diff limit updated successfully to ${parsed}.`);
    return;
  }
}

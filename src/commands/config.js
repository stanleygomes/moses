import { select } from '@inquirer/prompts';
import { checkAndFixConfigPermissions, readConfig, saveConfig } from '../utils/config-store.js';
import * as display from '../utils/display.js';

const FEEDBACK_STYLE_CHOICES = [
  { name: 'Amigável', value: 'friendly' },
  { name: 'Pragmático', value: 'pragmatic' },
  { name: 'Ofensivo', value: 'offensive' },
];

export async function runSetFeedbackStyle(style) {
  try {
    const config = await readConfig();
    const permissionStatus = await checkAndFixConfigPermissions();
    if (permissionStatus.fixed) {
      display.warn('Config permissions were incorrect and have been fixed to 600.');
    }
    const selectedStyle =
      style ||
      (await select({
        message: 'Choose the new review feedback style:',
        choices: FEEDBACK_STYLE_CHOICES,
        default: config.review?.feedbackStyle ?? 'pragmatic',
      }));
    if (!FEEDBACK_STYLE_CHOICES.find((item) => item.value === selectedStyle)) {
      display.error('Invalid style. Use: friendly, pragmatic, or offensive.');
      return;
    }
    const nextConfig = {
      ...config,
      review: {
        ...(config.review ?? {}),
        feedbackStyle: selectedStyle,
      },
    };
    await saveConfig(nextConfig);
    display.success(`Feedback style updated to "${selectedStyle}".`);
  } catch {
    display.error('Configuration not found. Run: moses init');
  }
}

export async function runSetMaxChanges(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    display.error('Invalid limit. Use a positive integer.');
    return;
  }
  try {
    const config = await readConfig();
    const permissionStatus = await checkAndFixConfigPermissions();
    if (permissionStatus.fixed) {
      display.warn('Config permissions were incorrect and have been fixed to 600.');
    }
    const nextConfig = {
      ...config,
      review: {
        ...(config.review ?? {}),
        maxChanges: parsed,
      },
    };
    await saveConfig(nextConfig);
    display.success(`Max changes limit updated to ${parsed}.`);
  } catch {
    display.error('Configuration not found. Run: moses init');
  }
}

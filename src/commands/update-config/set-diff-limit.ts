import { input } from '@inquirer/prompts';
import { DEFAULT_MAX_DIFF_CHANGES } from '../../constants.js';
import { saveConfig } from '../../utils/config-store.js';
import * as display from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';
import { loadConfigOrExit } from './load-config.js';

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

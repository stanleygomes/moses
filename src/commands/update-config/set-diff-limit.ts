import { input } from '@inquirer/prompts';
import { DEFAULT_MAX_DIFF_CHANGES } from '../../constants.js';
import { ConfigStore } from '../../utils/config-store.js';
import { Display } from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';
import { UpdateConfigLoader } from './load-config.js';

export class SetDiffLimitCommand {
  static async run(): Promise<void> {
    Display.banner();
    const config = await UpdateConfigLoader.loadConfigOrExit();
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
        Display.error('Invalid value. Please inform a positive integer.');
        continue;
      }

      const nextConfig: MosesConfig = {
        ...config,
        ai: {
          ...config.ai,
          maxDiffChanges: parsed,
        },
      };
      await ConfigStore.saveConfig(nextConfig);
      Display.success(`Diff limit updated successfully to ${parsed}.`);
      return;
    }
  }
}

import { DEFAULT_MAX_DIFF_CHANGES } from '../../constants/ai.constant.js';
import { ConfigStore } from '../../store/config.store.js';
import { Display } from '../../utils/display.util.js';
import { Prompt } from '../../utils/prompt.util.js';
import { diffLimitSchema } from '../../validators/diff-limit.validator.js';
import type { MosesConfig } from '../../types/moses-config.type.js';

export class SetDiffLimitModule {
  static async run(): Promise<void> {
    Display.banner();

    try {
      const config = await ConfigStore.get();
      const limit = await this.promptForLimit(config.ai?.maxDiffChanges);

      await this.updateAndSave(config, limit);
    } catch (error) {
      this.handleError(error);
    }
  }

  private static async promptForLimit(currentLimit?: number): Promise<number> {
    const fallback =
      Number.isInteger(currentLimit) && currentLimit! > 0 ? currentLimit : DEFAULT_MAX_DIFF_CHANGES;

    return Prompt.ask<number>({
      message: 'Maximum allowed diff changes before interrupting validation:',
      default: String(fallback),
      schema: diffLimitSchema,
    });
  }

  private static async updateAndSave(config: MosesConfig, limit: number): Promise<void> {
    const nextConfig: MosesConfig = {
      ...config,
      ai: {
        ...config.ai,
        maxDiffChanges: limit,
      },
    };

    await ConfigStore.set(nextConfig);
    Display.success(`Diff limit updated successfully to ${limit}.`);
  }

  private static handleError(error: unknown): void {
    Display.error('Could not update diff limit.');
    console.log(error);
  }
}

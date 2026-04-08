import { DEFAULT_MAX_DIFF_CHANGES } from '../constants/ai.constant.js';
import { Display } from '../utils/display.util.js';
import { Prompt } from '../utils/prompt.util.js';
import { ConfigUtil } from '../utils/config.util.js';
import { diffLimitSchema } from '../validators/diff-limit.validator.js';
import type { MosesConfig } from '../types/moses-config.type.js';

export class DiffLimitManager {
  static async promptForLimit(currentLimit?: number): Promise<number> {
    const fallback =
      Number.isInteger(currentLimit) && currentLimit! > 0 ? currentLimit : DEFAULT_MAX_DIFF_CHANGES;

    return Prompt.ask<number>({
      message: 'Maximum allowed diff changes before interrupting validation:',
      default: String(fallback),
      schema: diffLimitSchema,
    });
  }

  static async updateAndSave(config: MosesConfig, limit: number): Promise<void> {
    await ConfigUtil.updateAiAndSave(config, { maxDiffChanges: limit });
    Display.success(`Diff limit updated successfully to ${limit}.`);
  }

  static handleError(error: unknown): void {
    Display.error('Could not update diff limit.');
    console.log(error);
  }
}

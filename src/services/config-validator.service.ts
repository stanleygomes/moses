import { MESSAGES } from '../constants/messages.constant.js';
import { ConfigStore } from '../store/config.store.js';
import { Display } from '../utils/display.util.js';
import type { MosesConfig } from '../types/moses-config.type.js';

export class ConfigValidator {
  static async getConfig(): Promise<MosesConfig | null> {
    const config = await ConfigStore.getSafe();
    if (!config) {
      Display.error(MESSAGES.noConfig);
    }
    return config;
  }
}

import { MESSAGES } from '../../constants.js';
import { ConfigStore } from '../../utils/config-store.js';
import { Display } from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export class ValidateConfigLoader {
  static async loadValidatedConfig(): Promise<MosesConfig | null> {
    try {
      const config = await ConfigStore.readConfig();
      const permissionStatus = await ConfigStore.checkAndFixConfigPermissions();
      if (permissionStatus.fixed) {
        Display.warn('Config permissions were incorrect and have been fixed to 600.');
      }
      return config;
    } catch {
      Display.error(MESSAGES.noConfig);
      return null;
    }
  }
}

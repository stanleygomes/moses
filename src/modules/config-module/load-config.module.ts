import { MESSAGES } from '../../constants/messages.constant.js';
import { ConfigStore } from '../../utils/config-store.util.js';
import { Display } from '../../utils/display.util.js';
import type { MosesConfig } from '../../types/moses-config.type.js';

export class UpdateConfigLoaderModule {
  static async loadConfigOrExit(): Promise<MosesConfig | null> {
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

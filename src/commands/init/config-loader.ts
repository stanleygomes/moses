import { ConfigStore } from '../../utils/config-store.js';
import { Display } from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export class InitConfigLoader {
  static async loadExistingConfig(): Promise<MosesConfig | null> {
    try {
      const config = await ConfigStore.readConfig();
      const permissionStatus = await ConfigStore.checkAndFixConfigPermissions();
      if (permissionStatus.fixed) {
        Display.warn(
          `Permissions were automatically fixed to 600 at ${ConfigStore.getConfigPath()}`,
        );
      }
      return config;
    } catch {
      return null;
    }
  }
}

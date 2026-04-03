import { MESSAGES } from '../../constants.js';
import { checkAndFixConfigPermissions, readConfig } from '../../utils/config-store.js';
import * as display from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export async function loadConfigOrExit(): Promise<MosesConfig | null> {
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

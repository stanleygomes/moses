import path from 'node:path';
import { DEFAULT_CONFIG_DIR } from '../constants/paths.constant.js';
import type { MosesConfig } from '../types/moses-config.type.js';
import { FsUtil } from '../utils/fs.util.js';
import { JsonUtil } from '../utils/json.util.js';

export class ConfigStore {
  static async get(): Promise<MosesConfig> {
    const configPath = ConfigStore.getConfigPath();
    const content = await FsUtil.readTextFile(configPath);

    return JsonUtil.parse<MosesConfig>(content);
  }

  static async set(config: MosesConfig): Promise<void> {
    const configPath = ConfigStore.getConfigPath();
    const content = JSON.stringify(config, null, 2);

    await FsUtil.writeTextFile(configPath, content);
    await FsUtil.setPermissions(configPath, 0o600);
  }

  private static getConfigPath(): string {
    return path.join(ConfigStore.getConfigDir(), 'config.json');
  }

  private static getConfigDir(): string {
    return FsUtil.resolveHome(DEFAULT_CONFIG_DIR);
  }
}

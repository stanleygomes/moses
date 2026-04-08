import path from 'node:path';
import { DEFAULT_CONFIG_DIR } from '../constants/paths.constant.js';
import type { GitlabInstance } from '../types/gitlab-instance.type.js';
import type { MosesConfig } from '../types/moses-config.type.js';
import { FsUtil } from '../utils/fs.util.js';
import { JsonUtil } from '../utils/json.util.js';

import { Display } from '../utils/display.util.js';

export class ConfigStore {
  static async get(): Promise<MosesConfig> {
    const configPath = ConfigStore.getConfigPath();
    const content = await FsUtil.readTextFile(configPath);

    return JsonUtil.parse<MosesConfig>(content);
  }

  static async getSafe(): Promise<MosesConfig | null> {
    try {
      const config = await this.get();
      await this.checkAndFixPermissions();
      return config;
    } catch {
      return null;
    }
  }

  private static async checkAndFixPermissions(): Promise<void> {
    const configPath = this.getConfigPath();
    try {
      const stats = await FsUtil.getStats(configPath);
      const mode = stats.mode & 0o777;

      if (mode !== 0o600) {
        await FsUtil.setPermissions(configPath, 0o600);
        Display.warn(`Permissions were automatically fixed to 600 at ${configPath}`);
      }
    } catch {
      // Ignore if file doesn't exist
    }
  }

  static async set(config: MosesConfig): Promise<string> {
    const configPath = ConfigStore.getConfigPath();
    const content = JSON.stringify(config, null, 2);

    await FsUtil.writeTextFile(configPath, content);
    await FsUtil.setPermissions(configPath, 0o600);

    return configPath;
  }

  static findGitlabInstance(config: MosesConfig, host: string): GitlabInstance | null {
    const gitlabs = config.gitlabs ?? [];
    return (
      gitlabs.find((item) => {
        try {
          const urlHost = new URL(item.url).host;
          return urlHost === host;
        } catch {
          return false;
        }
      }) ??
      gitlabs.find((item) => item.default) ??
      null
    );
  }

  private static getConfigPath(): string {
    return path.join(ConfigStore.getConfigDir(), 'config.json');
  }

  private static getConfigDir(): string {
    return FsUtil.resolveHome(DEFAULT_CONFIG_DIR);
  }
}

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DEFAULT_CONFIG_DIR, DEFAULT_OUTPUT_DIR } from '../constants/paths.constant.js';
import type { ConfigPermissionStatus } from '../types/ConfigPermissionStatus.js';
import type { GitlabInstance } from '../types/GitlabInstance.js';
import type { MosesConfig } from '../types/MosesConfig.js';

export class ConfigStore {
  private static resolveHome(value: string): string {
    return value.replace(/^~(?=\/|$)/, os.homedir());
  }

  static getConfigDir(): string {
    return ConfigStore.resolveHome(DEFAULT_CONFIG_DIR);
  }

  static getOutputDir(): string {
    return ConfigStore.resolveHome(DEFAULT_OUTPUT_DIR);
  }

  static getConfigPath(): string {
    return path.join(ConfigStore.getConfigDir(), 'config.json');
  }

  static async ensureDirectories(): Promise<void> {
    await fs.mkdir(ConfigStore.getConfigDir(), { recursive: true });
    await fs.mkdir(ConfigStore.getOutputDir(), { recursive: true });
  }

  static async readConfig(): Promise<MosesConfig> {
    const configPath = ConfigStore.getConfigPath();
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content) as MosesConfig;
  }

  static async saveConfig(config: MosesConfig): Promise<string> {
    await ConfigStore.ensureDirectories();
    const configPath = ConfigStore.getConfigPath();
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    await fs.chmod(configPath, 0o600);
    return configPath;
  }

  static async checkAndFixConfigPermissions(): Promise<ConfigPermissionStatus> {
    const configPath = ConfigStore.getConfigPath();
    const stats = await fs.stat(configPath);
    const mode = stats.mode & 0o777;
    if (mode !== 0o600) {
      await fs.chmod(configPath, 0o600);
      return { fixed: true, previousMode: mode };
    }
    return { fixed: false, previousMode: mode };
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
}

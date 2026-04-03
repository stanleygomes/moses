import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DEFAULT_CONFIG_DIR, DEFAULT_OUTPUT_DIR } from '../constants.js';
import type { ConfigPermissionStatus, MosesConfig } from '../types.js';

const resolveHome = (value: string): string => value.replace(/^~(?=\/|$)/, os.homedir());

export const getConfigDir = (): string => resolveHome(DEFAULT_CONFIG_DIR);
export const getOutputDir = (): string => resolveHome(DEFAULT_OUTPUT_DIR);
export const getConfigPath = (): string => path.join(getConfigDir(), 'config.json');

export async function ensureDirectories(): Promise<void> {
  await fs.mkdir(getConfigDir(), { recursive: true });
  await fs.mkdir(getOutputDir(), { recursive: true });
}

export async function readConfig(): Promise<MosesConfig> {
  const configPath = getConfigPath();
  const content = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(content) as MosesConfig;
}

export async function saveConfig(config: MosesConfig): Promise<string> {
  await ensureDirectories();
  const configPath = getConfigPath();
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  await fs.chmod(configPath, 0o600);
  return configPath;
}

export async function checkAndFixConfigPermissions(): Promise<ConfigPermissionStatus> {
  const configPath = getConfigPath();
  const stats = await fs.stat(configPath);
  const mode = stats.mode & 0o777;
  if (mode !== 0o600) {
    await fs.chmod(configPath, 0o600);
    return { fixed: true, previousMode: mode };
  }
  return { fixed: false, previousMode: mode };
}

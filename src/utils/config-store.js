import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DEFAULT_CONFIG_DIR, DEFAULT_OUTPUT_DIR } from '../constants.js';

const resolveHome = (value) => value.replace(/^~(?=\/|$)/, os.homedir());

export const getConfigDir = () => resolveHome(DEFAULT_CONFIG_DIR);
export const getOutputDir = () => resolveHome(DEFAULT_OUTPUT_DIR);
export const getConfigPath = () => path.join(getConfigDir(), 'config.json');

export async function ensureDirectories() {
  await fs.mkdir(getConfigDir(), { recursive: true });
  await fs.mkdir(getOutputDir(), { recursive: true });
}

export async function readConfig() {
  const configPath = getConfigPath();
  const content = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(content);
}

export async function saveConfig(config) {
  await ensureDirectories();
  const configPath = getConfigPath();
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  await fs.chmod(configPath, 0o600);
  return configPath;
}

export async function checkAndFixConfigPermissions() {
  const configPath = getConfigPath();
  const stats = await fs.stat(configPath);
  const mode = stats.mode & 0o777;
  if (mode !== 0o600) {
    await fs.chmod(configPath, 0o600);
    return { fixed: true, previousMode: mode };
  }
  return { fixed: false, previousMode: mode };
}

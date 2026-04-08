import axios from 'axios';
import { spawn } from 'node:child_process';
import chalk from 'chalk';
import dayjs from 'dayjs';
import packageJson from '../../package.json' with { type: 'json' };
import { ConfigStore } from '../store/config.store.js';
import { Display } from '../utils/display.util.js';

export class UpdateService {
  static async getLatestVersion(): Promise<string | null> {
    try {
      const response = await axios.get(`https://registry.npmjs.org/${packageJson.name}/latest`, {
        timeout: 2000,
      });
      return response.data.version || null;
    } catch {
      return null;
    }
  }

  static isNewer(latest: string): boolean {
    const current = packageJson.version;
    if (!latest) return false;

    return latest !== current;
  }

  static async installLatest(): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('npm', ['install', '-g', `${packageJson.name}@latest`], {
        stdio: 'inherit',
        shell: true,
      });

      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Process exited with code ${code}`));
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
  }

  static async notifyUpdateIfAvailable(): Promise<void> {
    const config = await ConfigStore.getSafe();
    if (!config) return;

    const now = dayjs();
    const lastCheck = config.lastUpdateCheck ? dayjs(config.lastUpdateCheck) : null;

    // Only check once a day to avoid slowing down every execution
    if (!lastCheck || now.diff(lastCheck, 'day') >= 1) {
      const latest = await UpdateService.getLatestVersion();

      if (latest && UpdateService.isNewer(latest)) {
        console.log('');
        Display.info(chalk.bold.yellow(`🚀 New version available: ${latest}`));
        Display.info(`Run ${chalk.cyan('moses update')} to update to the latest version.`);
        console.log('');
      }

      config.lastUpdateCheck = now.toISOString();
      await ConfigStore.set(config);
    }
  }
}

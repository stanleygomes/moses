import os from 'node:os';
import fs from 'node:fs/promises';
import type { Stats } from 'node:fs';

export class FsUtil {
  static async ensureDir(path: string): Promise<void> {
    await fs.mkdir(path, { recursive: true });
  }

  static async readTextFile(path: string): Promise<string> {
    return await fs.readFile(path, 'utf-8');
  }

  static async writeTextFile(path: string, content: string): Promise<void> {
    await fs.writeFile(path, content, 'utf-8');
  }

  static async setPermissions(path: string, mode: number): Promise<void> {
    await fs.chmod(path, mode);
  }

  static async getStats(path: string): Promise<Stats> {
    return await fs.stat(path);
  }

  static resolveHome(value: string): string {
    return value.replace(/^~(?=\/|$)/, os.homedir());
  }
}

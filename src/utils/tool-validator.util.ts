import { execSync } from 'node:child_process';
import { AiToolUtil } from './ai-tool.util.js';
import type { AiToolKey } from '../types/ai-tool-key.type.js';
import type { ToolValidationResult } from '../types/tool-validation-result.type.js';

export class ToolValidator {
  static getInstallUrl(toolKey: AiToolKey): string {
    const tool = AiToolUtil.findByKey(toolKey);
    return tool?.docs ?? '';
  }

  static validateToolInstallation(toolKey: AiToolKey): ToolValidationResult {
    const tool = AiToolUtil.findByKey(toolKey);
    if (!tool) {
      return { installed: false, installUrl: '' };
    }

    try {
      const commandPath = execSync(`which ${tool.command}`, { stdio: 'pipe' }).toString().trim();
      try {
        execSync(`${tool.command} --version`, { stdio: 'pipe' });
      } catch {
        execSync(`${tool.command} --help`, { stdio: 'pipe' });
      }
      return { installed: true, path: commandPath };
    } catch {
      return {
        installed: false,
        installCmd: tool.install,
        installUrl: tool.docs,
      };
    }
  }
}

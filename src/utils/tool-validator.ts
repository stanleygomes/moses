import { execSync } from 'node:child_process';
import { AI_TOOLS } from '../constants.js';
import type { AiToolKey } from '../types/AiToolKey.js';
import type { ToolValidationResult } from '../types/ToolValidationResult.js';

export function getInstallUrl(toolKey: AiToolKey): string {
  const tool = AI_TOOLS.find((item) => item.key === toolKey);
  return tool?.docs ?? '';
}

export function validateToolInstallation(toolKey: AiToolKey): ToolValidationResult {
  const tool = AI_TOOLS.find((item) => item.key === toolKey);
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

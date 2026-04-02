import { execSync } from 'node:child_process';
import { AI_TOOLS } from '../constants.js';

export function getInstallUrl(toolKey) {
  const tool = AI_TOOLS.find((item) => item.key === toolKey);
  return tool?.docs ?? '';
}

export function validateToolInstallation(toolKey) {
  const tool = AI_TOOLS.find((item) => item.key === toolKey);
  if (!tool) {
    return { installed: false, installUrl: '' };
  }

  try {
    const commandPath = execSync(`which ${tool.command}`, { stdio: 'pipe' }).toString().trim();
    execSync(`${tool.command} --version`, { stdio: 'pipe' });
    return { installed: true, path: commandPath };
  } catch {
    return {
      installed: false,
      installCmd: tool.install,
      installUrl: tool.docs,
    };
  }
}

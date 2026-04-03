import type { AiToolKey } from './AiToolKey.js';
export interface AiToolDefinition {
  key: AiToolKey;
  name: string;
  command: string;
  args: string[];
  install: string;
  docs: string;
}

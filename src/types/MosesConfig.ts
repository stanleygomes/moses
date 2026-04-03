import type { GitlabInstance } from './GitlabInstance.js';
import type { AiConfig } from './AiConfig.js';
import type { OutputConfig } from './OutputConfig.js';

export interface MosesConfig {
  version: string;
  defaultGitlab: string;
  gitlabs: GitlabInstance[];
  ai: AiConfig;
  output: OutputConfig;
}

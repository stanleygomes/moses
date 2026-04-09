import type { GitlabInstance } from './gitlab-instance.type.js';
import type { AiConfig } from './ai-config.type.js';
import type { OutputConfig } from './output-config.type.js';

export interface MosesConfig {
  version: string;
  defaultGitlab: string;
  gitlabs: GitlabInstance[];
  ai: AiConfig;
  output: OutputConfig;
}

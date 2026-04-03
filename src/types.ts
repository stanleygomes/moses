export type FeedbackStyle = 'friendly' | 'pragmatic' | 'offensive';
export type AiToolKey = 'copilot' | 'gemini';

export interface AiToolDefinition {
  key: AiToolKey;
  name: string;
  command: string;
  args: string[];
  install: string;
  docs: string;
}

export interface GitlabInstance {
  name: string;
  url: string;
  token: string;
  default: boolean;
}

export interface OutputConfig {
  dir: string;
  keepFiles: boolean;
}

export interface AiConfig {
  tool: AiToolKey;
  customCommand: string | null;
  model: string | null;
  feedbackStyle: FeedbackStyle;
  maxDiffChanges: number;
}

export interface MosesConfig {
  version: string;
  defaultGitlab: string;
  gitlabs: GitlabInstance[];
  ai: AiConfig;
  output: OutputConfig;
}

export interface ConfigPermissionStatus {
  fixed: boolean;
  previousMode: number;
}

export interface MergeRequestAuthor {
  name?: string;
  username?: string;
}

export interface MergeRequestData {
  iid: number;
  title: string;
  author?: MergeRequestAuthor;
  source_branch: string;
  target_branch: string;
  created_at: string;
  changes_count?: string | number;
  description?: string | null;
}

export interface MergeRequestDiff {
  diff?: string;
  new_path?: string;
  old_path?: string;
}

export interface MergeRequestCommit {
  short_id: string;
  title: string;
}

export interface MergeRequestBundle {
  mr: MergeRequestData;
  diffs: MergeRequestDiff[];
  commits: MergeRequestCommit[];
}

export interface ParsedMergeRequestUrl {
  host: string;
  projectPath: string;
  mrIid: string;
  projectId: string;
}

export interface ValidateOptions {
  prompt?: string;
}

export interface RunAiReviewOptions {
  feedbackStyle?: FeedbackStyle;
  contextPrompt?: string;
}

export interface RunAiReviewHandlers {
  options?: RunAiReviewOptions;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
  onClose?: (code: number | null) => void;
  onError?: (error: Error) => void;
}

export type ToolValidationResult =
  | { installed: true; path: string }
  | { installed: false; installCmd?: string; installUrl: string };

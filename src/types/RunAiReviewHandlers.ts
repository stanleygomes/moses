import type { RunAiReviewOptions } from './RunAiReviewOptions.js';

export interface RunAiReviewHandlers {
  options?: RunAiReviewOptions;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
  onClose?: (code: number | null) => void;
  onError?: (error: Error) => void;
}

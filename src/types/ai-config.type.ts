import type { AiToolKey } from './ai-tool-key.type.js';
import type { FeedbackStyle } from './feedback-style.type.js';

export interface AiConfig {
  tool: AiToolKey;
  customCommand: string | null;
  feedbackStyle: FeedbackStyle;
  maxDiffChanges: number;
}

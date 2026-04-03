import type { AiToolKey } from './AiToolKey.js';
import type { FeedbackStyle } from './FeedbackStyle.js';

export interface AiConfig {
  tool: AiToolKey;
  customCommand: string | null;
  model: string | null;
  feedbackStyle: FeedbackStyle;
  maxDiffChanges: number;
}

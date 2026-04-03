import type { FeedbackStyle } from './FeedbackStyle.js';

export interface RunAiReviewOptions {
  feedbackStyle?: FeedbackStyle;
  contextPrompt?: string;
}

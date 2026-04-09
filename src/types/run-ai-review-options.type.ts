import type { FeedbackStyle } from './feedback-style.type.js';

export interface RunAiReviewOptions {
  feedbackStyle?: FeedbackStyle;
  contextPrompt?: string;
  model?: string;
}

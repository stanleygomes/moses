import { FEEDBACK_STYLES } from '../constants/feedback.constant.js';
import { Prompt } from './prompt.util.js';
import type { FeedbackStyle } from '../types/feedback-style.type.js';

export class FeedbackStyleUtil {
  static getDefault(currentStyle?: FeedbackStyle): FeedbackStyle {
    return FEEDBACK_STYLES.find((item) => item.key === currentStyle)?.key ?? FEEDBACK_STYLES[1].key;
  }

  static async promptSelection(currentStyle?: FeedbackStyle): Promise<FeedbackStyle> {
    return Prompt.select<FeedbackStyle>({
      message: 'Choose MR feedback style:',
      choices: FEEDBACK_STYLES.map((item) => ({ name: item.label, value: item.key })),
      default: FeedbackStyleUtil.getDefault(currentStyle),
    });
  }
}

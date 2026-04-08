import { AI_TOOLS } from '../constants/ai.constant.js';
import { FEEDBACK_STYLES } from '../constants/feedback.constant.js';
import { Display } from '../utils/display.util.js';
import { ToolValidator } from '../utils/tool-validator.util.js';
import { Prompt } from '../utils/prompt.util.js';
import { diffLimitSchema } from '../validators/diff-limit.validator.js';
import type { AiToolKey } from '../types/ai-tool-key.type.js';
import type { FeedbackStyle } from '../types/feedback-style.type.js';
import type { MosesConfig } from '../types/moses-config.type.js';

export interface AiSetupData {
  tool: AiToolKey;
  feedbackStyle: FeedbackStyle;
  maxDiffChanges: number;
}

export class AiSetupWizard {
  static async promptAiSetup(existingConfig: MosesConfig | null): Promise<AiSetupData> {
    Display.section('🤖 AI TOOL CONFIGURATION');
    Display.info(
      '💡 TIP: Moses uses local AI tools to process reviews. Make sure your chosen tool',
    );
    Display.info('   is installed and configured with the necessary API keys.');

    const tool = await AiSetupWizard.chooseAiTool(existingConfig?.ai?.tool);

    Display.info('\n💡 Feedback Style: Choose how you want the AI to post comments on the MR.');
    const feedbackStyle = await AiSetupWizard.chooseFeedbackStyle(
      existingConfig?.ai?.feedbackStyle,
    );

    Display.info('\n💡 Diff Limits: Large files can be slow and expensive (tokens).');
    Display.info('   This limit skips files with too many changes.');
    const maxDiffChanges = await AiSetupWizard.chooseMaxDiffChanges(
      existingConfig?.ai?.maxDiffChanges,
    );

    return { tool, feedbackStyle, maxDiffChanges };
  }

  static async chooseAiTool(existingTool: AiToolKey | undefined): Promise<AiToolKey> {
    while (true) {
      const chosen = await Prompt.select<AiToolKey>({
        message: 'Choose the AI tool for review:',
        choices: AI_TOOLS.map((tool) => ({ name: tool.name, value: tool.key })),
        default: existingTool,
      });

      const toolInfo = AI_TOOLS.find((tool) => tool.key === chosen);
      if (!toolInfo) {
        throw new Error(`Unsupported AI tool: ${String(chosen)}`);
      }

      const toolSpinner = Display.spinner(`Checking ${toolInfo.name} installation...`);
      const validation = ToolValidator.validateToolInstallation(toolInfo.key);
      toolSpinner.stop();

      if (validation.installed) {
        Display.success(`${toolInfo.name} found at ${validation.path}`);
        return toolInfo.key;
      }

      Display.error(`${toolInfo.name} not found!`);
      Display.info(`\n📦 Install with:\n   ${validation.installCmd ?? toolInfo.install}`);
      Display.info(`\n📖 Documentation: ${validation.installUrl}\n`);
      const retry = await Prompt.confirm({
        message: 'Do you want to choose another tool?',
        default: true,
      });
      if (!retry) {
        throw new Error('AI tool not installed. Install a supported tool and run again.');
      }
    }
  }

  static async chooseFeedbackStyle(
    existingStyle: FeedbackStyle | undefined,
  ): Promise<FeedbackStyle> {
    const defaultStyle =
      FEEDBACK_STYLES.find((item) => item.key === existingStyle)?.key ?? FEEDBACK_STYLES[1].key;

    return Prompt.select<FeedbackStyle>({
      message: 'Choose MR feedback style:',
      choices: FEEDBACK_STYLES.map((item) => ({ name: item.label, value: item.key })),
      default: defaultStyle as FeedbackStyle,
    });
  }

  static async chooseMaxDiffChanges(existingLimit: number | undefined): Promise<number> {
    return Prompt.ask<number>({
      message: 'Maximum allowed diff changes before interrupting validation:',
      default: String(existingLimit),
      schema: diffLimitSchema,
    });
  }
}

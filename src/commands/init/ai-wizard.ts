import { confirm, input, select } from '@inquirer/prompts';
import { AI_TOOLS, DEFAULT_MAX_DIFF_CHANGES, FEEDBACK_STYLES } from '../../constants.js';
import { Display } from '../../utils/display.js';
import { ToolValidator } from '../../utils/tool-validator.js';
import type { AiToolKey } from '../../types/AiToolKey.js';
import type { FeedbackStyle } from '../../types/FeedbackStyle.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export interface AiSetupData {
  tool: AiToolKey;
  feedbackStyle: FeedbackStyle;
  maxDiffChanges: number;
}

export class AiWizard {
  static async promptAiSetup(existingConfig: MosesConfig | null): Promise<AiSetupData> {
    Display.section('🤖 AI TOOL CONFIGURATION');
    Display.info(
      '💡 TIP: Moses uses local AI tools to process reviews. Make sure your chosen tool',
    );
    Display.info('   is installed and configured with the necessary API keys.');

    const tool = await AiWizard.chooseAiTool(existingConfig?.ai?.tool);

    Display.info('\n💡 Feedback Style: Choose how you want the AI to post comments on the MR.');
    const feedbackStyle = await AiWizard.chooseFeedbackStyle(existingConfig?.ai?.feedbackStyle);

    Display.info('\n💡 Diff Limits: Large files can be slow and expensive (tokens).');
    Display.info('   This limit skips files with too many changes.');
    const maxDiffChanges = await AiWizard.chooseMaxDiffChanges(existingConfig?.ai?.maxDiffChanges);

    return { tool, feedbackStyle, maxDiffChanges };
  }

  static async chooseAiTool(existingTool: AiToolKey | undefined): Promise<AiToolKey> {
    while (true) {
      const chosen = await select({
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
      const retry = await confirm({
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
    return select({
      message: 'Choose MR feedback style:',
      choices: FEEDBACK_STYLES.map((item) => ({ name: item.label, value: item.key })),
      default: defaultStyle,
    });
  }

  static async chooseMaxDiffChanges(existingLimit: number | undefined): Promise<number> {
    const fallback =
      typeof existingLimit === 'number' && Number.isInteger(existingLimit) && existingLimit > 0
        ? existingLimit
        : DEFAULT_MAX_DIFF_CHANGES;
    while (true) {
      const value = await input({
        message: 'Maximum allowed diff changes before interrupting validation:',
        default: String(fallback),
      });
      const parsed = Number.parseInt(value, 10);
      if (Number.isInteger(parsed) && parsed > 0) return parsed;
      Display.error('Invalid value. Please inform a positive integer.');
    }
  }
}

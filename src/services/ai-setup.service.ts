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
    AiSetupWizard.displayIntro();

    const tool = await AiSetupWizard.chooseAiTool(existingConfig?.ai?.tool);

    AiSetupWizard.displayFeedbackStyleTip();
    const feedbackStyle = await AiSetupWizard.chooseFeedbackStyle(
      existingConfig?.ai?.feedbackStyle,
    );

    AiSetupWizard.displayDiffLimitTip();
    const maxDiffChanges = await AiSetupWizard.chooseMaxDiffChanges(
      existingConfig?.ai?.maxDiffChanges,
    );

    return { tool, feedbackStyle, maxDiffChanges };
  }

  static async chooseAiTool(existingTool: AiToolKey | undefined): Promise<AiToolKey> {
    while (true) {
      const chosen = await AiSetupWizard.promptAiTool(existingTool);
      const toolInfo = AiSetupWizard.findAiToolByKey(chosen);
      const validation = AiSetupWizard.validateAiToolInstallation(toolInfo);

      if (validation.installed && validation.path) {
        Display.success(`${toolInfo.name} found at ${validation.path}`);
        return chosen;
      }

      if (!validation.installed) {
        AiSetupWizard.displayAiToolInstallInfo(
          toolInfo,
          validation.installCmd,
          validation.installUrl,
        );
      }
      const shouldRetry = await AiSetupWizard.askRetryToolSelection();
      if (!shouldRetry) {
        throw new Error('AI tool not installed. Install a supported tool and run again.');
      }
    }
  }

  private static displayIntro(): void {
    Display.section('🤖 AI TOOL CONFIGURATION');
    Display.info(
      '💡 TIP: Moses uses local AI tools to process reviews. Make sure your chosen tool',
    );
    Display.info('   is installed and configured with the necessary API keys.');
  }

  private static displayFeedbackStyleTip(): void {
    Display.info('\n💡 Feedback Style: Choose how you want the AI to post comments on the MR.');
  }

  private static displayDiffLimitTip(): void {
    Display.info('\n💡 Diff Limits: Large files can be slow and expensive (tokens).');
    Display.info('   This limit skips files with too many changes.');
  }

  private static async promptAiTool(existingTool: AiToolKey | undefined): Promise<AiToolKey> {
    return Prompt.select<AiToolKey>({
      message: 'Choose the AI tool for review:',
      choices: AI_TOOLS.map((tool) => ({ name: tool.name, value: tool.key })),
      default: existingTool,
    });
  }

  private static findAiToolByKey(toolKey: AiToolKey) {
    const toolInfo = AI_TOOLS.find((tool) => tool.key === toolKey);
    if (!toolInfo) {
      throw new Error(`Unsupported AI tool: ${String(toolKey)}`);
    }
    return toolInfo;
  }

  private static validateAiToolInstallation(toolInfo: { key: AiToolKey; name: string }) {
    const toolSpinner = Display.spinner(`Checking ${toolInfo.name} installation...`);
    const validation = ToolValidator.validateToolInstallation(toolInfo.key);
    toolSpinner.stop();
    return validation;
  }

  private static displayAiToolInstallInfo(
    toolInfo: { install: string; name: string },
    installCmd: string | undefined,
    installUrl: string,
  ): void {
    Display.error(`${toolInfo.name} not found!`);
    Display.info(`\n📦 Install with:\n   ${installCmd ?? toolInfo.install}`);
    Display.info(`\n📖 Documentation: ${installUrl}\n`);
  }

  private static async askRetryToolSelection(): Promise<boolean> {
    return Prompt.confirm({
      message: 'Do you want to choose another tool?',
      default: true,
    });
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

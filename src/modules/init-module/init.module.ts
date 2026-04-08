import { MESSAGES } from '../../constants/messages.constant.js';
import { Display } from '../../utils/display.util.js';
import { ConfigStore } from '../../store/config.store.js';
import { Prompt } from '../../utils/prompt.util.js';
import { ContextService } from '../../services/context.js';
import { GitlabWizard } from './gitlab-wizard.js';
import { AiWizard } from './ai-wizard.js';
import { InitConfigBuilder } from './config-builder.js';
import type { MosesConfig } from '../../types/moses-config.type.js';

export class InitModule {
  static async run(): Promise<void> {
    Display.banner();
    Display.info(MESSAGES.welcome);

    const existingConfig = await ConfigStore.getSafe();

    const confirmOverwrite = await this.confirmOverwrite();
    if (existingConfig && !confirmOverwrite) {
      Display.info('No changes applied.');
      return;
    }

    await this.startWizard(existingConfig);
  }

  private static async confirmOverwrite(): Promise<boolean> {
    return Prompt.confirm({
      message: 'Existing configuration found. Do you want to overwrite/add a new instance?',
      default: true,
    });
  }

  private static async startWizard(existingConfig: MosesConfig | null): Promise<void> {
    const gitlabData = await GitlabWizard.promptGitlabSetup(existingConfig);
    const aiData = await AiWizard.promptAiSetup(existingConfig);

    const config = InitConfigBuilder.build(gitlabData, aiData, existingConfig);
    const configPath = await ConfigStore.set(config);
    const contextInfo = await ContextService.ensureDefaultContextFiles();

    this.displaySummary(configPath, contextInfo);
  }

  private static displaySummary(
    configPath: string,
    contextInfo: { contextDir: string; files: string[] },
  ): void {
    Display.success(MESSAGES.done);
    Display.info(`📁 Config saved at ${configPath} (mode 600)`);
    Display.info(`📁 Context files saved at ${contextInfo.contextDir}:`);
    contextInfo.files.forEach((file) => Display.info(`   - ${file}`));

    Display.info(`\n${MESSAGES.next}`);
  }
}

import { confirm } from '@inquirer/prompts';
import { MESSAGES } from '../../constants/messages.constant.js';
import { Display } from '../../utils/display.js';
import { InitConfigLoader } from './config-loader.js';
import { GitlabWizard } from './gitlab-wizard.js';
import { AiWizard } from './ai-wizard.js';
import { InitConfigBuilder } from './config-builder.js';

export class InitCommand {
  static async run(): Promise<void> {
    Display.banner();
    Display.info(MESSAGES.welcome);

    const existingConfig = await InitConfigLoader.loadExistingConfig();
    if (existingConfig) {
      const overwrite = await confirm({
        message: 'Existing configuration found. Do you want to overwrite/add a new instance?',
        default: true,
      });
      if (!overwrite) {
        Display.info('No changes applied.');
        return;
      }
    }

    const gitlabData = await GitlabWizard.promptGitlabSetup(existingConfig);
    const aiData = await AiWizard.promptAiSetup(existingConfig);

    const { configPath, contextInfo } = await InitConfigBuilder.buildAndSaveConfig(
      gitlabData,
      aiData,
      existingConfig,
    );

    Display.success(MESSAGES.done);
    Display.info(`📁 Config saved at ${configPath} (mode 600)`);
    Display.info(`📁 Context files saved at ${contextInfo.contextDir}:`);
    contextInfo.files.forEach((file) => Display.info(`   - ${file}`));

    Display.info(`\n${MESSAGES.next}`);
  }
}

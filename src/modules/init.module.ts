import { MESSAGES } from '../constants/messages.constant.js';
import { AiSetupWizard } from '../services/ai-setup.service.js';
import { ConfigInitializer } from '../services/config-init.service.js';
import { ConfigSummary } from '../services/config-summary.service.js';
import { ContextManager } from '../services/context-manager.service.js';
import { GitlabSetupWizard } from '../services/gitlab/gitlab-setup.service.js';
import { ConfigStore } from '../store/config.store.js';
import { Display } from '../utils/display.util.js';
import { Prompt } from '../utils/prompt.util.js';

export class InitModule {
  static async run(): Promise<void> {
    Display.banner();
    Display.info(MESSAGES.welcome);

    const existingConfig = await ConfigStore.getSafe();

    const confirmOverwrite = await Prompt.confirm({
      message: 'Existing configuration found. Do you want to overwrite/add a new instance?',
      default: true,
    });

    if (existingConfig && !confirmOverwrite) {
      Display.info('No changes applied.');
      return;
    }

    const gitlabData = await GitlabSetupWizard.promptGitlabSetup(existingConfig);
    const aiData = await AiSetupWizard.promptAiSetup(existingConfig);

    const config = ConfigInitializer.build(gitlabData, aiData, existingConfig);
    const configPath = await ConfigStore.set(config);
    const contextInfo = await ContextManager.ensureDefaultContextFiles();

    ConfigSummary.display(configPath, contextInfo);
  }
}

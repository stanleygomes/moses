import { ConfigStore } from '../store/config.store.js';
import { ContextManager } from './context-manager.service.js';
import { GitlabSetupWizard } from './gitlab-setup.service.js';
import { AiSetupWizard } from './ai-setup.service.js';
import { ConfigInitService } from './config-init.service.js';
import { ConfigSummaryService } from './config-summary.service.js';
import type { MosesConfig } from '../types/moses-config.type.js';

export class SetupWizardFlow {
  static async run(existingConfig: MosesConfig | null): Promise<void> {
    const gitlabData = await GitlabSetupWizard.promptGitlabSetup(existingConfig);
    const aiData = await AiSetupWizard.promptAiSetup(existingConfig);

    const config = ConfigInitService.build(gitlabData, aiData, existingConfig);
    const configPath = await ConfigStore.set(config);
    const contextInfo = await ContextManager.ensureDefaultContextFiles();

    ConfigSummaryService.display(configPath, contextInfo);
  }
}

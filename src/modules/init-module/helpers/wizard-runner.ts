import { ConfigStore } from '../../../store/config.store.js';
import { ContextService } from '../../../services/context.js';
import { GitlabWizard } from './gitlab-wizard.js';
import { AiWizard } from './ai-wizard.js';
import { InitConfigBuilder } from './config-builder.js';
import { InitSummary } from './init-summary.js';
import type { MosesConfig } from '../../../types/moses-config.type.js';

export class WizardRunner {
  static async run(existingConfig: MosesConfig | null): Promise<void> {
    const gitlabData = await GitlabWizard.promptGitlabSetup(existingConfig);
    const aiData = await AiWizard.promptAiSetup(existingConfig);

    const config = InitConfigBuilder.build(gitlabData, aiData, existingConfig);
    const configPath = await ConfigStore.set(config);
    const contextInfo = await ContextService.ensureDefaultContextFiles();

    InitSummary.display(configPath, contextInfo);
  }
}

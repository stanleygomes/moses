import { MESSAGES } from '../constants/messages.constant.js';
import { Display } from '../utils/display.util.js';
import { ConfigStore } from '../store/config.store.js';
import { Prompt } from '../utils/prompt.util.js';
import { SetupWizardFlow } from '../services/wizard-flow.service.js';

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

    await SetupWizardFlow.run(existingConfig);
  }
}

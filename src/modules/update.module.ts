import { Display } from '../utils/display.util.js';
import { UpdateService } from '../services/update.service.js';

export class UpdateModule {
  static async run(): Promise<void> {
    Display.banner();
    const spinner = Display.spinner('Checking for updates...');

    try {
      const latest = await UpdateService.getLatestVersion();

      if (!latest || !UpdateService.isNewer(latest)) {
        spinner.succeed('You are already on the latest version.');
        return;
      }

      spinner.info(`New version found: ${latest}. Updating...`);

      const updateSpinner = Display.spinner('Running: npm install -g moses-cli@latest');
      try {
        await UpdateService.installLatest();
        updateSpinner.succeed(`Successfully updated to the latest version: ${latest}`);
        Display.info('\nPlease restart your terminal or run moses --version to verify.');
      } catch (error) {
        updateSpinner.fail('Failed to update automatically.');
        Display.error('Please try running manually: npm install -g moses-cli@latest');
        if (error instanceof Error) Display.info(`\nError details: ${error.message}`);
      }
    } catch (error) {
      spinner.fail('Failed to connect to npm registry.');
      if (error instanceof Error) Display.info(`\nError details: ${error.message}`);
    }
  }
}

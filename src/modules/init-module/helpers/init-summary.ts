import { MESSAGES } from '../../../constants/messages.constant.js';
import { Display } from '../../../utils/display.util.js';

export class InitSummary {
  static display(configPath: string, contextInfo: { contextDir: string; files: string[] }): void {
    Display.success(MESSAGES.done);
    Display.info(`📁 Config saved at ${configPath} (mode 600)`);
    Display.info(`📁 Context files saved at ${contextInfo.contextDir}:`);
    contextInfo.files.forEach((file) => Display.info(`   - ${file}`));

    Display.info(`\n${MESSAGES.next}`);
  }
}

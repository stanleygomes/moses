import { MESSAGES } from '../constants/messages.constant.js';
import { DisplayUtil } from '../utils/display.util.js';

export class ConfigSummaryService {
  static display(configPath: string, contextInfo: { contextDir: string; files: string[] }): void {
    DisplayUtil.success(MESSAGES.done);
    DisplayUtil.info(`📁 Config saved at ${configPath} (mode 600)`);
    DisplayUtil.info(`📁 Context files saved at ${contextInfo.contextDir}:`);
    contextInfo.files.forEach((file) => DisplayUtil.info(`   - ${file}`));

    DisplayUtil.info(`\n${MESSAGES.next}`);
  }
}

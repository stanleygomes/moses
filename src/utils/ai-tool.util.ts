import { AI_TOOLS } from '../constants/ai.constant.js';
import type { AiToolKey } from '../types/ai-tool-key.type.js';
import type { AiToolDefinition } from '../types/ai-tool-definition.type.js';

export class AiToolUtil {
  static findByKey(toolKey: AiToolKey): AiToolDefinition | undefined {
    return AI_TOOLS.find((tool) => tool.key === toolKey);
  }

  static getByKeyOrThrow(toolKey: AiToolKey): AiToolDefinition {
    const tool = AiToolUtil.findByKey(toolKey);
    if (!tool) {
      throw new Error(`Unsupported AI tool: ${String(toolKey)}`);
    }
    return tool;
  }
}

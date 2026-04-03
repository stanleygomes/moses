import { countDiffChanges } from '../../services/markdown.js';
import * as display from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';
import type { MergeRequestDiff } from '../../types/MergeRequestDiff.js';

export function isDiffWithinLimits(diffs: MergeRequestDiff[], config: MosesConfig): boolean {
  const maxDiffChanges = config.ai?.maxDiffChanges;
  const totalChanges = countDiffChanges(diffs);
  if (Number.isInteger(maxDiffChanges) && maxDiffChanges > 0 && totalChanges > maxDiffChanges) {
    display.warn(
      `Diff interrompido: total de changes (${totalChanges}) excede o limite configurado (${maxDiffChanges}). Atualize o limite com: moses set-diff-limit`,
    );
    return false;
  }
  return true;
}

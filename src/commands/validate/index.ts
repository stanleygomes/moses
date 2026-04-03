import * as display from '../../utils/display.js';
import { loadValidatedConfig } from './load-config.js';
import { fetchMrData } from './gitlab.js';
import { isDiffWithinLimits } from './check-limits.js';
import { runReviewTask } from './review.js';
import type { ValidateOptions } from '../../types/ValidateOptions.js';

export async function execute(url: string, options: ValidateOptions = {}): Promise<void> {
  display.banner();
  display.info(`🔗 Analyzing: ${url}`);

  const config = await loadValidatedConfig();
  if (!config) return;

  const data = await fetchMrData(url, config);
  if (!data) return;

  if (!isDiffWithinLimits(data.diffs, config)) return;

  await runReviewTask(url, data, config, options);
}

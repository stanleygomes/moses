import type { MergeRequestData } from './MergeRequestData.js';
import type { MergeRequestDiff } from './MergeRequestDiff.js';
import type { MergeRequestCommit } from './MergeRequestCommit.js';

export interface MergeRequestBundle {
  mr: MergeRequestData;
  diffs: MergeRequestDiff[];
  commits: MergeRequestCommit[];
}

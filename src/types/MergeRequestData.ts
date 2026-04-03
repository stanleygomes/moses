import type { MergeRequestAuthor } from './MergeRequestAuthor.js';

export interface MergeRequestData {
  iid: number;
  title: string;
  author?: MergeRequestAuthor;
  source_branch: string;
  target_branch: string;
  created_at: string;
  changes_count?: string | number;
  description?: string | null;
}

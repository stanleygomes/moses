import dayjs from 'dayjs';
import type { MergeRequestBundle } from '../types/merge-request-bundle.type.js';
import type { MergeRequestDiff } from '../types/merge-request-diff.type.js';

interface BuildMergeRequestMarkdownInput {
  mr: MergeRequestBundle['mr'];
  diffs: MergeRequestBundle['diffs'];
  commits: MergeRequestBundle['commits'];
  url: string;
}

export class MrMarkdownFormatter {
  static buildMergeRequestMarkdown({
    mr,
    diffs,
    commits,
    url,
  }: BuildMergeRequestMarkdownInput): string {
    const createdAt = dayjs(mr.created_at).format('YYYY-MM-DD');
    const commitLines = MrMarkdownFormatter.formatCommitLines(commits);
    const diffSections = MrMarkdownFormatter.formatDiffSections(diffs);
    const stats = MrMarkdownFormatter.buildStatsSection(diffs, mr.changes_count);

    return `# MR #${mr.iid} — ${mr.title}

**Author:** @${mr.author?.username ?? 'unknown'}  
**Branch:** ${mr.source_branch} → ${mr.target_branch}  
**Date:** ${createdAt}  
**URL:** ${url}

## 📊 Statistics

${stats}

## 📝 Description

${mr.description ?? '_No description_'}

## 📦 Commits

${commitLines || '_No commits_'}

## 🔍 Diffs

${diffSections || '_No diffs_'}
`;
  }

  private static buildStatsSection(
    diffs: MergeRequestBundle['diffs'],
    changesCount: string | number | null | undefined,
  ): string {
    const changedFiles = Array.isArray(diffs) ? diffs.length : 0;
    const additions = changesCount ?? '?';
    return `- Changed files: ${changedFiles}
- Changes (GitLab): ${additions}`;
  }

  private static formatCommitLines(commits: MergeRequestBundle['commits']): string {
    return commits.map((commit) => `- ${commit.short_id} — ${commit.title}`).join('\n');
  }

  private static formatDiffSections(diffs: MergeRequestBundle['diffs']): string {
    return diffs
      .map((item) => {
        const diff = item.diff ?? '';
        return `### \`${item.new_path ?? item.old_path}\`\n\n\`\`\`diff\n${diff}\n\`\`\`\n`;
      })
      .join('\n');
  }

  static countDiffChanges(diffs: MergeRequestDiff[] = []): number {
    if (!Array.isArray(diffs)) return 0;
    return diffs.reduce((total, item) => {
      const diff = item.diff ?? '';
      const lines = diff.split('\n');
      const fileChanges = lines.filter((line) => {
        if (!(line.startsWith('+') || line.startsWith('-'))) return false;
        if (line.startsWith('+++') || line.startsWith('---')) return false;
        return true;
      }).length;
      return total + fileChanges;
    }, 0);
  }
}

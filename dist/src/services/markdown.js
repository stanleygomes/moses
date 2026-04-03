import dayjs from 'dayjs';
export function buildMergeRequestMarkdown({ mr, diffs, commits, url, }) {
    const createdAt = dayjs(mr.created_at).format('YYYY-MM-DD');
    const changedFiles = Array.isArray(diffs) ? diffs.length : 0;
    const additions = mr.changes_count ?? '?';
    const commitLines = commits.map((commit) => `- ${commit.short_id} — ${commit.title}`).join('\n');
    const diffSections = diffs
        .map((item) => {
        const diff = item.diff ?? '';
        return `### \`${item.new_path ?? item.old_path}\`\n\n\`\`\`diff\n${diff}\n\`\`\`\n`;
    })
        .join('\n');
    return `# MR #${mr.iid} — ${mr.title}

**Author:** @${mr.author?.username ?? 'unknown'}  
**Branch:** ${mr.source_branch} → ${mr.target_branch}  
**Date:** ${createdAt}  
**URL:** ${url}

## 📊 Statistics

- Changed files: ${changedFiles}
- Changes (GitLab): ${additions}

## 📝 Description

${mr.description ?? '_No description_'}

## 📦 Commits

${commitLines || '_No commits_'}

## 🔍 Diffs

${diffSections || '_No diffs_'}
`;
}
export function countDiffChanges(diffs = []) {
    if (!Array.isArray(diffs))
        return 0;
    return diffs.reduce((total, item) => {
        const diff = item.diff ?? '';
        const lines = diff.split('\n');
        const fileChanges = lines.filter((line) => {
            if (!(line.startsWith('+') || line.startsWith('-')))
                return false;
            if (line.startsWith('+++') || line.startsWith('---'))
                return false;
            return true;
        }).length;
        return total + fileChanges;
    }, 0);
}

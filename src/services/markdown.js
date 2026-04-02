import dayjs from 'dayjs';

export function buildMergeRequestMarkdown({ mr, diffs, commits, url }) {
  const createdAt = dayjs(mr.created_at).format('YYYY-MM-DD');
  const changedFiles = Array.isArray(diffs) ? diffs.length : 0;
  const additions = mr?.changes_count ?? '?';

  const commitLines = commits
    .map((commit) => `- ${commit.short_id} — ${commit.title}`)
    .join('\n');

  const diffSections = diffs
    .map((item) => {
      const diff = item.diff ?? '';
      return `### \`${item.new_path ?? item.old_path}\`\n\n\`\`\`diff\n${diff}\n\`\`\`\n`;
    })
    .join('\n');

  return `# MR #${mr.iid} — ${mr.title}

**Autor:** @${mr.author?.username ?? 'desconhecido'}  
**Branch:** ${mr.source_branch} → ${mr.target_branch}  
**Data:** ${createdAt}  
**URL:** ${url}

## 📊 Estatísticas

- Arquivos alterados: ${changedFiles}
- Mudanças (GitLab): ${additions}

## 📝 Descrição

${mr.description ?? '_Sem descrição_'}

## 📦 Commits

${commitLines || '_Sem commits_'}

## 🔍 Diffs

${diffSections || '_Sem diffs_'}
`;
}

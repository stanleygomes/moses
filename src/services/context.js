import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const resolveHome = (value) => value.replace(/^~(?=\/|$)/, os.homedir());

export function getContextDir() {
  return resolveHome('~/.config/moses/context');
}

export function getBasePromptPath() {
  return path.join(getContextDir(), 'base-prompt.md');
}

export function getPracticesPath() {
  return path.join(getContextDir(), 'mr-practices.md');
}

export async function ensureDefaultContextFiles() {
  const contextDir = getContextDir();
  await fs.mkdir(contextDir, { recursive: true });

  const basePromptPath = getBasePromptPath();
  const practicesPath = getPracticesPath();

  try {
    await fs.access(basePromptPath);
  } catch {
    await fs.writeFile(
      basePromptPath,
      `# Prompt base para revisão de MR

Você é um revisor sênior de código.
Analise o diff enviado e responda APENAS no formato abaixo:

1) Resumo geral da qualidade do MR
2) Pontos críticos (segurança, bugs, performance)
3) Sugestões objetivas por arquivo/trecho
4) Decisão final (aprovar, aprovar com ressalvas, reprovar) com justificativa curta
`,
      'utf-8',
    );
  }

  try {
    await fs.access(practicesPath);
  } catch {
    await fs.writeFile(
      practicesPath,
      `# Boas e más práticas para validar no MR

## Boas práticas
- Tratamento explícito de erros
- Nomes claros para funções e variáveis
- Código simples e legível
- Validação de entradas do usuário
- Logs úteis sem dados sensíveis

## Más práticas
- Falta de validação de input
- Exposição de secrets/tokens em código/log
- Trechos duplicados sem necessidade
- Código morto ou não utilizado
- Falta de tratamento de exceções
`,
      'utf-8',
    );
  }
}

export async function readContextPrompt(extraPrompt = '') {
  const [basePrompt, practices] = await Promise.all([
    fs.readFile(getBasePromptPath(), 'utf-8'),
    fs.readFile(getPracticesPath(), 'utf-8'),
  ]);

  const segments = [basePrompt.trim(), practices.trim()];
  if (extraPrompt?.trim()) {
    segments.push(`# Contexto adicional do usuário\n${extraPrompt.trim()}`);
  }
  return `${segments.join('\n\n')}\n`;
}

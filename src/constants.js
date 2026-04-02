export const APP_NAME = 'moses';
export const CONFIG_VERSION = '1';

export const DEFAULT_CONFIG_DIR = '~/.config/moses';
export const DEFAULT_OUTPUT_DIR = '~/.config/moses/reviews';

export const MESSAGES = {
  welcome: '🚀 Bem-vindo ao moses! Vamos configurar sua CLI.',
  done: '✅ Configuração concluída!',
  next: '💡 Próximo passo: moses validate <url-do-mr>',
  noConfig: 'Configuração não encontrada. Rode: moses init',
};

export const EMOJIS = {
  ok: '✅',
  fail: '❌',
  robot: '🤖',
  link: '🔗',
  folder: '📁',
  stats: '📊',
  commit: '📦',
};

export const AI_TOOLS = [
  {
    key: 'copilot',
    name: 'GitHub Copilot CLI (gh copilot)',
    command: 'gh',
    args: ['copilot', 'explain'],
    install: 'gh extension install github/gh-copilot',
    docs: 'https://docs.github.com/copilot/github-copilot-in-the-cli',
  },
  {
    key: 'claude',
    name: 'Claude Code (claude)',
    command: 'claude',
    args: ['--prompt'],
    install: 'npm install -g @anthropic-ai/claude-cli',
    docs: 'https://docs.anthropic.com/cli',
  },
  {
    key: 'chatgpt',
    name: 'ChatGPT CLI (chatgpt)',
    command: 'chatgpt',
    args: [],
    install: 'npm install -g @adasupport/openai-cli',
    docs: 'https://platform.openai.com/docs',
  },
  {
    key: 'gemini',
    name: 'Google Gemini CLI (gemini)',
    command: 'gemini',
    args: ['generate-text'],
    install: 'npm install -g @google/gemini-cli',
    docs: 'https://cloud.google.com/ai/docs',
  },
  {
    key: 'aider',
    name: 'Aider (aider)',
    command: 'aider',
    args: ['--message'],
    install: 'pip install aider-chat',
    docs: 'https://aider.chat/docs',
  },
];

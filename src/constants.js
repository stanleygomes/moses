export const APP_NAME = "moses";
export const CONFIG_VERSION = "1";

export const DEFAULT_CONFIG_DIR = "~/.config/moses";
export const DEFAULT_OUTPUT_DIR = "~/.config/moses/reviews";

export const MESSAGES = {
  welcome: "🚀 Welcome to moses! Let's set up your CLI.",
  done: "✅ Setup completed!",
  next: "💡 Next step: moses validate <mr-url>",
  noConfig: "Configuration not found. Run: moses init",
};

export const EMOJIS = {
  ok: "✅",
  fail: "❌",
  robot: "🤖",
  link: "🔗",
  folder: "📁",
  stats: "📊",
  commit: "📦",
};

export const AI_TOOLS = [
  {
    key: "copilot",
    name: "GitHub Copilot CLI (copilot)",
    command: "gh",
    args: ["copilot", "explain"],
    install: "npm install -g @github/copilot",
    docs: "https://docs.github.com/copilot/github-copilot-in-the-cli",
  },
  {
    key: "claude",
    name: "Claude Code (claude)",
    command: "claude",
    args: ["--prompt"],
    install: "npm install -g @anthropic-ai/claude-cli",
    docs: "https://docs.anthropic.com/cli",
  },
  {
    key: "chatgpt",
    name: "ChatGPT CLI (chatgpt)",
    command: "chatgpt",
    args: [],
    install: "npm install -g @openai/codex",
    docs: "https://platform.openai.com/docs",
  },
  {
    key: "gemini",
    name: "Google Gemini CLI (gemini)",
    command: "gemini",
    args: ["generate-text"],
    install: "npm install -g @google/gemini-cli",
    docs: "https://cloud.google.com/ai/docs",
  },
];

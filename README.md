<div align="center">

# moses-cli

**moses** is your CLI to help code review of GitLab Merge Requests using AI tools like GitHub Copilot CLI and Gemini CLI.

[![npm version](https://img.shields.io/npm/v/@moses-cli/core.svg)](https://www.npmjs.com/package/@moses-cli/core)
[![Node.js Version](https://img.shields.io/badge/node->=18-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

## Installation

📦 Install the npm package

```bash
npm install -g @moses-cli/core
```

## Initial Setup

```bash
moses init
```

The command:

1. Configures GitLab instance (cloud or self-hosted)
2. Validates token via `/api/v4/user` API
3. Selects AI tool
4. Saves config in `~/.config/moses/config.json` with mode `600`

## Usage

You can simply run

```bash
moses validate https://gitlab.your-domain.com/group/project/-/merge_requests/123
```

Flow:

1. Parses MR URL
2. Fetches MR data + diffs + commits from GitLab API
3. Loads context markdown files from `~/.config/moses/context/`
4. Concatenates context files + optional prompt + MR diff and sends to configured AI tool
5. Displays response in terminal with loading indicator

### Why moses?

Like Moses guiding his people to the promised land, moses validates every merge request, ensuring your most precious asset—your code—reaches production safely.

- ⚡ **Fast analysis**: Fetches diffs directly from GitLab API
- 🤖 **Multi-AI**: Focus on tested support for GitHub Copilot CLI and Gemini CLI
- 🔒 **Secure**: Tokens stored with 600 permissions, never exposed
- 📊 **Comprehensive**: Generates structured markdown with stats, commits, and diffs

## Features

- Interactive setup with token validation
- Support for multiple GitLab instances (gitlab.com + self-hosted)
- Automatic validation of AI tool installation
- Real-time streaming of AI analysis
- Configurable feedback style (amigável, pragmático, ofensivo)
- Configurable diff changes limit with safe interruption
- Optional extra prompt context in `moses validate`
- Elegant error handling with contextual messages

## For local development

```bash
npm install
npm run build
npm link
```

### Quality scripts

```bash
npm run check-types
npm run lint
npm run lint:fix
npm run format
```

## 🤖 Supported AI Tools

| Tool              | CLI       | Installation                        |
| ----------------- | --------- | ----------------------------------- |
| GitHub Copilot    | `copilot` | `npm install -g @github/copilot`    |
| Google Gemini CLI | `gemini`  | `npm install -g @google/gemini-cli` |

✅ These two CLIs are the ones currently tested in this project.

🙏 Quer ajudar? Contribuições para suporte ao **Claude Code** e **Codex CLI** são muito bem-vindas.

## ⚙️ Commands

```bash
moses init
moses validate <mr-url> --prompt "contexto adicional opcional"
moses set-feedback-style
moses set-diff-limit
```

For GitHub Copilot, moses runs non-interactive mode with:

```bash
copilot -p "prompt"
```

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

Made with 🔥 by Lumen HQ

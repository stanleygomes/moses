<div align="center">

# moses

**moses** is your CLI to help review GitLab Merge Requests using AI tools like GitHub Copilot CLI and Gemini CLI.

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
4. Selects feedback style (amigável, pragmático ou ofensivo)
5. Defines maximum `changes_count` limit to protect token usage
4. Saves config in `~/.config/moses/config.json` with mode `600`

## Usage

You can simply run

```bash
moses validate https://gitlab.your-domain.com/group/project/-/merge_requests/123
```

With additional context prompt:

```bash
moses validate https://gitlab.your-domain.com/group/project/-/merge_requests/123 -p "Considere também regras internas do time para serviços críticos"
```

Flow:

1. Parses MR URL
2. Fetches MR data + diffs + commits from GitLab API
3. Concatenates context markdowns + optional user prompt + MR diff
4. Sends content to configured AI tool
5. Displays response only in terminal (no markdown output file)
6. Shows loading while analyzing and (Linux) system notification on completion

### Why moses?

Like Moses guiding his people to the promised land, moses validates every merge request, ensuring your most precious asset—your code—reaches production safely.

- ⚡ **Fast analysis**: Fetches diffs directly from GitLab API
- 🤖 **Multi-AI**: Support focused on GitHub Copilot CLI and Gemini CLI
- 🔒 **Secure**: Tokens stored with 600 permissions, never exposed
- 📊 **Comprehensive**: Generates structured markdown with stats, commits, and diffs

## Features

- Interactive setup with token validation
- Support for multiple GitLab instances (gitlab.com + self-hosted)
- Automatic validation of AI tool installation
- Real-time streaming of AI analysis
- Prompt composition with context files + optional user prompt
- Configurable feedback style and max diff changes limit
- Terminal-only output with loading feedback
- Elegant error handling with contextual messages

### ⚙️ Update review settings after init

```bash
moses set-feedback-style
moses set-feedback-style friendly
moses set-max-changes 3000
```

## For local development

```bash
npm install
npm link
```

## 🤖 Supported AI Tools

| Tool              | CLI          | Installation                              |
| ----------------- | ------------ | ----------------------------------------- |
| GitHub Copilot CLI (tested) | `copilot`    | `npm install -g @github/copilot`          |
| Google Gemini CLI | `gemini`     | `npm install -g @google/gemini-cli`       |

### 🙌 Roadmap de Suporte

No momento, o suporte oficial e testado é apenas para **GitHub Copilot CLI** e **Gemini CLI**.

Quer ajudar? Contribuições são muito bem-vindas para adicionar suporte ao:

- Claude Code
- Codex

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🔗 Links Úteis

- [Turborepo Docs](https://turborepo.dev/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel](https://vercel.com)

Made with 🔥 by Lumen HQ

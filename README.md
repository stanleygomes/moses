<div align="center">

# moses-cli

CLI buddy to help you with code review of GitLab Merge Requests, by using AI tools like GitHub Copilot CLI and Gemini CLI.

[![npm version](https://img.shields.io/npm/v/@moses-cli/core.svg)](https://www.npmjs.com/package/@moses-cli/core)
[![Node.js Version](https://img.shields.io/badge/node->=18-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

![moses-cli](https://raw.githubusercontent.com/stanleygomes/moses-cli/refs/heads/master/assets/screenshot.png)

## Installation

Install the npm package

```bash
npm install -g moses-cli
```

## Initial Setup

```bash
moses init
```

The command:

1. Configures GitLab instance (cloud or self-hosted)
2. Validates token via `/api/v4/user` API
3. Selects AI tool
4. Saves config in `~/.moses-cli/config.json` with mode `600`

## Usage

You can simply run

```bash
moses validate https://gitlab.your-domain.com/group/project/-/merge_requests/123
```

To know more about the commands, run:

```bash
moses help
```

Flow:

1. Parses MR URL
2. Fetches MR data + diffs + commits from GitLab API
3. Loads context markdown files from `~/.moses-cli/context/`
4. Concatenates context files + optional prompt + MR diff and sends to configured AI tool
5. Displays response in terminal

### Why moses?

Like Moses guiding his people to the promised land, moses validates every merge request, ensuring your most precious asset—your code—reaches production safely.

- **Fast analysis**: Fetches diffs directly from GitLab API
- **Multi-AI**: Focus on tested support for GitHub Copilot CLI and Gemini CLI
- **Secure**: Tokens stored with 600 permissions, never exposed
- **Comprehensive**: Generates structured markdown with stats, commits, and diffs

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
pnpm install
pnpm build
node dist/bin/moses.js
```

### Quality scripts

```bash
pnpm run check
```

## Supported AI Tools

| Tool              | CLI       | Installation                        |
| ----------------- | --------- | ----------------------------------- |
| GitHub Copilot    | `copilot` | `npm install -g @github/copilot`    |
| Google Gemini CLI | `gemini`  | `npm install -g @google/gemini-cli` |

These two CLIs are the ones currently tested in this project.

Want to help? Contributions to support **Claude Code** and **Codex CLI** are very welcome.

## How to Contribute

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

Made with 🔥 by Lumen HQ

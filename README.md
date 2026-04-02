<div align="center">

# 🔍 moses

**Validação automática de Merge Requests do GitLab com IA**

[![npm version](https://img.shields.io/npm/v/@moses-cli/core.svg)](https://www.npmjs.com/package/@moses-cli/core)
[![Node.js Version](https://img.shields.io/badge/node->=18-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 Índice

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Instalação](#instalação)
- [Configuração Inicial](#configuração-inicial)
- [Uso](#uso)
- [Ferramentas de IA Suportadas](#ferramentas-de-ia-suportadas)
- [Exemplos](#exemplos)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Sobre

**moses** é uma CLI Node.js que automatiza a revisão de código de Merge Requests do GitLab usando ferramentas de IA como GitHub Copilot, Claude, ChatGPT, Gemini e Aider.

### Por que moses?

- ⚡ **Análise rápida**: Busca diffs diretamente da API do GitLab
- 🤖 **Multi-IA**: Suporte para 5 ferramentas de IA líderes de mercado
- 🔒 **Seguro**: Tokens armazenados com permissões 600, nunca expostos
- 📊 **Completo**: Gera markdown estruturado com stats, commits e diffs
- 🎨 **Visual**: Interface colorida com spinners e emojis

---

## ✨ Funcionalidades

- ✅ Configuração interativa com validação de tokens
- ✅ Suporte a múltiplas instâncias GitLab (gitlab.com + self-hosted)
- ✅ Validação automática de instalação de ferramentas IA
- ✅ Streaming em tempo real da análise de IA
- ✅ Export de diffs em Markdown com formatação rica
- ✅ Tratamento elegante de erros com mensagens contextuais

---

## 📦 Instalação

### Via npm (Global)

```bash
npm install -g @moses-cli/core
```

### Via npx (Sem instalação)

```bash
npx @moses-cli/core init
npx @moses-cli/core validate <url>
```

### Para desenvolvimento local

```bash
npm install
npm link
```

---

## ⚙️ Configuração Inicial

```bash
moses init
```

O comando:

1. Configura instância GitLab (cloud ou self-hosted)
2. Valida token via API `/api/v4/user`
3. Seleciona ferramenta de IA
4. Salva config em `~/.config/moses/config.json` com modo `600`

---

## 🚀 Uso

```bash
moses validate https://gitlab.seu-dominio.com/grupo/projeto/-/merge_requests/123
```

Fluxo:

1. Faz parse da URL do MR
2. Busca dados do MR + diffs + commits na API GitLab
3. Gera markdown em `~/.config/moses/reviews/`
4. Envia conteúdo para ferramenta IA configurada
5. Exibe resposta em streaming no terminal

---

## 🤖 Ferramentas de IA Suportadas

| Ferramenta | CLI | Instalação |
|---|---|---|
| GitHub Copilot | `gh copilot` | `gh extension install github/gh-copilot` |
| Claude Code | `claude` | `npm install -g @anthropic-ai/claude-cli` |
| ChatGPT CLI | `chatgpt` | `npm install -g @adasupport/openai-cli` |
| Google Gemini CLI | `gemini` | `npm install -g @google/gemini-cli` |
| Aider | `aider` | `pip install aider-chat` |

---

## 🧪 Exemplos

```bash
moses init
moses validate https://gitlab.com/grupo/projeto/-/merge_requests/42
```

---

## 🛠 Troubleshooting

- **Config não encontrada:** rode `moses init`
- **Token inválido:** gere novo token com escopo `api`
- **MR 404:** confira URL, permissões e VPN
- **IA não instalada:** instale a CLI da ferramenta selecionada
- **Permissões inválidas:** o moses corrige automaticamente para `chmod 600`

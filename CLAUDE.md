# moses-cli (Go Refactor)

CLI buddy to help with code review of GitLab Merge Requests using AI tools.

## Development Commands

- **Build**: `make build` (Output: `./bin/moses`)
- **Run**: `make run`
- **Test**: `make test`
- **Lint**: `make lint`
- **Format**: `make fmt`
- **Clean**: `make clean`

## CLI Commands (To Implement)

- `moses init`: Interactive setup (GitLab, AI tools)
- `moses validate <url>`: Fetch and analyze Merge Request
- `moses gitlab list`: List configured instances
- `moses gitlab default`: Switch active instance
- `moses config <subcommand>`: Manage feedback-style, diff-limit, skills
- `moses config reset`: Wipe configuration

## Project Guidelines

- **Refactor Goal**: Port the entire logic from the Node.js implementation to a performant and maintainable Go codebase.
- **Style**: Follow standard Go conventions. Use `PascalCase` for exported symbols and `camelCase` for internal ones.
- **Error Handling**: Check every error. Wrap errors with context: `fmt.Errorf("context: %w", err)`.
- **CLI Framework**: Use `spf13/cobra` for command structure and `spf13/viper` for configuration.
- **UI/UX**: Maintain the elegant interactive experience from the original tool. Use `charmbracelets/bubbletea` or `lipgloss` for styling if possible.
- **Configuration**: Store in `~/.moses-cli/config.json` with `0600` permissions. Support multiple GitLab profiles.
- **Context Gathering**: Scan for instructions in `copilot-instructions.md`, `.github/copilot-instructions.md`, `CLAUDE.md`, `.clauderc`, and `README.md`.
- **AI Tools**: Must support streaming output for a real-time experience.

## Project Structure

- `cmd/moses/main.go`: Application entry point.
- `cmd/`: CLI command definitions (Cobra).
- `internal/`: Private library code (logic, API clients, etc.).
  - `internal/config/`: Configuration management.
  - `internal/gitlab/`: GitLab API client.
  - `internal/ai/`: AI tool wrappers.
  - `internal/ui/`: Terminal UI and formatting.
- `pkg/`: Publicly reusable packages (optional).


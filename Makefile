# ==============================================================================
# moses-cli - Makefile
# ==============================================================================
# Commands to facilitate project development and automation.
# Use 'make <command>' to execute.

.PHONY: build run test fmt lint clean help

# Configuration Variables
BINARY_NAME=bin/moses
MAIN_PACKAGE=./cmd/moses

# --- Build & Execution ---

build: ## Compile the project binary into the bin/ folder
	@echo "==> Compiling binary..."
	@mkdir -p bin
	go build -o $(BINARY_NAME) $(MAIN_PACKAGE)
	@echo "==> Done: $(BINARY_NAME)"

run: ## Execute the CLI directly without compiling a permanent binary
	go run $(MAIN_PACKAGE)

# --- Quality Control ---

test: ## Execute all unit tests with detailed output
	go test ./... -v

fmt: ## Format the code following standard Go conventions
	@echo "==> Formatting code..."
	go fmt ./...

lint: ## Run the linter to check for best practices and common errors
	@echo "==> Running linter..."
	golangci-lint run

# --- Maintenance ---

clean: ## Remove binary files and clear Go cache
	@echo "==> Cleaning files..."
	rm -rf bin
	go clean
	@echo "==> Cleaning complete."

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

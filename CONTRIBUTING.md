# Contributing to MCP Mermaid

Thank you for your interest in contributing to MCP Mermaid! This document provides guidelines and standards that all contributors must follow.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pre-Commit Hooks](#pre-commit-hooks)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Code Review Process](#code-review-process)

## Code of Conduct

Be respectful, inclusive, and professional. We're all here to build something great together.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mcp-mermaid.git
   cd mcp-mermaid
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/hustcc/mcp-mermaid.git
   ```

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm 9+
- Git

### Installation

```bash
# Install dependencies
npm install

# This automatically:
# - Installs all packages
# - Sets up Husky pre-commit hooks
# - Installs Playwright with dependencies
```

### Verify Setup

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Build the project
npm run build
```

## Coding Standards

### Code Style

We use **Biome** for linting and formatting. All code must pass Biome checks.

#### Checking for Issues

```bash
# Check for lint/format issues
npm run lint
```

#### Auto-fixing Issues

```bash
# Auto-fix safe issues with Biome
npx biome check --write .

# Format all files
npx biome format --write .

# Both check and format
npx biome check --write . && npx biome format --write .
```

**Note:** The pre-commit hook automatically runs linting on staged files, but you can manually fix issues before committing using the commands above.

#### Source Code (src/)

- ✅ Must follow Biome rules strictly
- ✅ Use TypeScript
- ✅ Use double quotes for strings
- ✅ 2-space indentation
- ✅ Use `node:` protocol for Node.js imports

#### Test Code (__tests__/)

- ✅ Can use `any` type where needed for mocking
- ✅ Must be readable and well-documented
- ✅ Use descriptive test names

### File Structure

```
src/
  ├── server.ts          # Main server logic
  ├── services/          # Transport services
  ├── tools/             # MCP tool definitions
  └── utils/             # Utility functions

__tests__/
  ├── server/            # Server tests
  ├── services/          # Service tests
  ├── tools/             # Tool tests
  └── utils/             # Utility tests
```

### Naming Conventions

- **Files**: camelCase (`mermaidUrl.ts`)
- **Classes**: PascalCase (`Logger`)
- **Functions**: camelCase (`renderMermaid`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_THEME`)
- **Interfaces/Types**: PascalCase (`RenderOptions`)

## Testing Requirements

### Minimum Coverage: 90%

All contributions **must maintain at least 90% test coverage** across:

- ✅ Statements: 90%
- ✅ Lines: 90%
- ✅ Branches: 90%
- ✅ Functions: 90%

**Current coverage: 100%** - Let's keep it that way! 🎯

### Writing Tests

#### Test Structure

```typescript
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("FeatureName", () => {
  beforeEach(() => {
    // Setup before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    vi.restoreAllMocks();
  });

  describe("functionName", () => {
    it("should do something specific", () => {
      // Arrange
      const input = "test";
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe("expected");
    });

    it("should handle error cases", () => {
      expect(() => functionName(null)).toThrow();
    });
  });
});
```

#### Test Requirements

- ✅ **Unit tests** for all functions
- ✅ **Integration tests** for API endpoints
- ✅ **Error path testing** - test failure scenarios
- ✅ **Edge cases** - null, undefined, empty values
- ✅ **Mocking** - use vi.mock() for external dependencies

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Coverage Report

After running `npm run test:coverage`, view the report:

```bash
# Open coverage report in browser
open coverage/index.html       # macOS
start coverage/index.html      # Windows
xdg-open coverage/index.html   # Linux
```

## Pre-Commit Hooks

**Pre-commit hooks are mandatory.** They run automatically before every commit.

### What Gets Checked

1. **Lint staged src files** - Auto-fixes formatting
2. **Run all tests with coverage** - Ensures 90% coverage
3. **Block commit if checks fail**

### Hook Setup

Hooks are automatically installed when you run `npm install`. If needed, manually install:

```bash
npx husky install
git config core.hooksPath .husky
```

### Pre-Commit Flow

```
git commit
    ↓
📝 Lint staged src files
    ↓
🧪 Run tests with coverage
    ↓
✅ Commit OR ❌ Blocked
```

### Bypassing Hooks (EMERGENCY ONLY)

```bash
git commit --no-verify -m "message"
```

⚠️ **WARNING:** Only use in true emergencies. CI will still fail if tests/coverage don't pass.

### Before Pushing

Before pushing your changes:

```bash
# Ensure everything passes
npm run lint
npm run test:coverage

# Ensure build works
npm run build
```

## Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `test/` - Test additions/fixes
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, tested code
- Add tests for new features
- Update documentation if needed
- Ensure all tests pass
- Maintain 90%+ coverage

### 3. Commit Your Changes

Follow the [commit message guidelines](#commit-message-guidelines).

```bash
git add .
git commit -m "feat: add new mermaid theme support"
```

The pre-commit hook will run automatically.

### 4. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub and create a PR
- Fill out the PR template
- Link related issues
- Wait for review

### PR Requirements

- ✅ All tests passing
- ✅ Coverage ≥ 90%
- ✅ Lint checks passing
- ✅ Build succeeds
- ✅ No merge conflicts
- ✅ CI/CD pipeline passes
- ✅ Reviewed by maintainer
- ✅ Documentation updated (if needed)

### CI/CD Checks

Every PR triggers automated checks:

1. **Lint Check** - Code style validation
2. **Test Coverage** - All 169 tests must pass
3. **Coverage Threshold** - Enforces 90% minimum
4. **Build Verification** - TypeScript compilation

**The PR cannot be merged until all CI checks pass.** ✅

See [CI Setup Guide](.github/CI_SETUP.md) for details.

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding/updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `style`: Code style changes (formatting)

### Examples

```bash
# Feature
git commit -m "feat(tools): add support for dark theme"

# Bug fix
git commit -m "fix(server): handle null mermaid code gracefully"

# Documentation
git commit -m "docs: update installation instructions"

# Tests
git commit -m "test(utils): add edge case tests for renderMermaid"

# Breaking change
git commit -m "feat(api)!: change output format structure

BREAKING CHANGE: outputType 'base64' now returns object instead of string"
```

## Development Scripts

```bash
# Testing
npm test               # Run all tests
npm run test:coverage  # Generate coverage report

# Linting
npm run lint           # Check code style

# Auto-fix lint issues
npx biome check --write .
npx biome format --write .

# Building
npm run build          # Build for production
npm start              # Start with inspector
=======
# Development
npm run test:watch      # Watch mode for tests
npm run test:ui         # Interactive test UI
npm run test:coverage   # Coverage report

# Linting
npm run lint            # Check code style
npm run lint:fix        # Auto-fix issues

# Building
npm run build           # Build for production
npm start               # Start with inspector

# Transport modes
npm run start:sse       # Start SSE server
npm run start:streamable # Start HTTP streamable server
```

## Getting Help

- 📖 Read the [README](./README.md)
- 🐛 Check [existing issues](https://github.com/hustcc/mcp-mermaid/issues)
- 💬 Ask questions in issues
- 📧 Contact maintainers

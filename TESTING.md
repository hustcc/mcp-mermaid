# Testing Documentation

## Overview

This project uses a comprehensive testing setup with:
- **Vitest** as the test framework and mocking library
- **Axios** for HTTP integration testing
- **@vitest/coverage-v8** for code coverage reporting

**Test Statistics:**
- Total Tests: **162**
- Test Files: **14**
- All Tests Passing: ✅
- Coverage: **100%** (all metrics)
- Execution Time: ~7-8 seconds

## Test Coverage Goals

The project maintains a **90% minimum coverage** threshold for:
- Lines: 90% (current: **100%**)
- Functions: 90% (current: **100%**)
- Branches: 90% (current: **100%**)
- Statements: 90% (current: **100%**)

**Current Status:** ✅ **100% coverage across all metrics!**

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm run test:coverage
```


## Test Structure

```
__tests__/
├── server/
│   ├── server.spec.ts      # Server creation and error handling tests
│   └── runners.spec.ts     # Server runner functions tests
├── services/
│   ├── index.spec.ts       # Service exports tests
│   ├── sse.spec.ts         # SSE service tests
│   ├── stdio.spec.ts       # STDIO service tests
│   └── streamable.spec.ts  # HTTP Streamable service tests
├── tools/
│   ├── index.spec.ts       # Tool exports tests
│   └── tools.spec.ts       # Tool schema validation tests
└── utils/
    ├── index.spec.ts       # Utility exports tests
    ├── logger.spec.ts      # Logger functionality tests
    ├── mermaidUrl.spec.ts  # Mermaid.ink URL encoding tests
    ├── render.spec.ts      # Mermaid rendering tests
    └── schema.spec.ts      # Zod to JSON schema conversion tests
```

## Testing Patterns

### 1. Module Mocking

We use Vitest's `vi.mock()` for mocking external dependencies:

```typescript
vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    close: vi.fn(),
  })),
}));
```

### 2. Spying on Functions

We use Vitest's `vi.spyOn()` for spying on function calls:

```typescript
let consoleLogSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  consoleLogSpy.mockRestore();
});

// Check if called
expect(consoleLogSpy.mock.calls.length > 0).toBe(true);

// Access call arguments
const allCalls = consoleLogSpy.mock.calls;
```

### 3. HTTP Integration Testing

We use Axios for testing HTTP endpoints with real servers:

```typescript
import axios from "axios";

const testPort = 13001;
await startSSEMcpServer(mockServer, "/sse", testPort);

try {
  const response = await axios.post(`http://localhost:${testPort}/messages`, {
    sessionId: "test-session",
    message: "test"
  });
  expect(response.status).toBe(200);
} catch (error) {
  // Handle expected errors
  expect(error.response?.status).toBe(400);
}
```

### 4. File System Mocking

File system operations are mocked to avoid actual I/O:

```typescript
vi.mock("node:fs");

const writeFileSyncSpy = vi.mocked(fs.writeFileSync).mockImplementation(() => {});
```

## Coverage Configuration

Coverage is configured in `vitest.config.ts`:

```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html", "lcov"],
  reportsDirectory: "./coverage",
  lines: 90,
  functions: 90,
  branches: 90,
  statements: 90,
  thresholds: {
    lines: 90,
    functions: 90,
    branches: 90,
    statements: 90,
    autoUpdate: false,
  },
}
```

## CodeCov Integration

Coverage reports are automatically uploaded to CodeCov via GitHub Actions:

1. Tests run on every push and pull request
2. Coverage is collected using v8 provider
3. Reports are uploaded to CodeCov
4. Coverage badges and PR comments are generated automatically

### Setup CodeCov Token

Add your CodeCov token to GitHub repository secrets:
1. Go to CodeCov and get your upload token
2. Add it as `CODECOV_TOKEN` in GitHub Settings → Secrets

## CI/CD

The project uses GitHub Actions for continuous testing and quality checks.

### Workflow: `.github/workflows/build.yml`

**Triggers:**
- Push to `main`, `master`, or `develop` branches
- Pull requests targeting these branches

**Jobs:**

The build workflow runs on **Node.js 18.x and 20.x** (matrix strategy) and performs:

1. **Checkout code**
2. **Setup Node.js**
3. **Install dependencies** (`npm install`)
4. **Lint check** (`npm run lint`) - Uses Biome
5. **Build project** (`npm run build`)
6. **Run tests with coverage** (`npm run test:coverage`)
7. **Check coverage threshold** (90% minimum enforced by vitest.config.ts)
8. **Upload to CodeCov** (Node 20.x only, optional)
9. **Save coverage artifacts** (30 days retention, Node 20.x only)

### Coverage Enforcement

Coverage thresholds are enforced by **Vitest configuration** (`vitest.config.ts`):

```typescript
coverage: {
  thresholds: {
    lines: 90,
    functions: 90,
    branches: 90,
    statements: 90,
  }
}
```

The test command will **automatically fail** if coverage drops below 90% on any metric.

**Build will fail if:**
- ❌ Lint errors exist
- ❌ Any test fails
- ❌ Coverage drops below 90% on any metric
- ❌ Build fails

### Artifacts

**Coverage Reports** (30 days retention, Node 20.x only):
- HTML coverage report (`coverage/index.html`)
- LCOV data (`coverage/lcov.info`)
- JSON coverage data (`coverage/coverage-final.json`)

**How to access:**
1. Go to Actions tab in GitHub
2. Click on a workflow run
3. Scroll to "Artifacts" section
4. Download "coverage-report"

## Best Practices

### 1. Test Isolation
- Use `beforeEach` to reset mocks
- Use `afterEach` to restore stubs
- Clear all mocks between tests

### 2. Meaningful Test Names
```typescript
it("should create SSEServerTransport instances", () => {
  // Test implementation
});
```

### 3. Test What Matters
- Focus on behavior, not implementation
- Test edge cases and error scenarios
- Ensure all exported functions are tested

### 4. Avoid Timeouts
- Don't test actual server startups that hang
- Mock long-running operations
- Use appropriate timeout values for async tests

### 5. Mock External Dependencies
- Always mock SDK transports
- Mock file system operations
- Mock external rendering libraries

## Coverage Reports

After running `npm run test:coverage`, view reports:

- **Terminal**: Summary is displayed in the console
- **HTML**: Open `coverage/index.html` in a browser
- **LCOV**: `coverage/lcov.info` for external tools

## Pre-Commit Hooks

The project uses **Husky** to enforce quality standards before commits:

### What Runs on Commit

1. **Lint-staged** - Lints and formats only staged `src/` files
2. **Test Coverage** - Runs all tests with coverage report
3. **Coverage Check** - Ensures coverage is ≥ 90%

### Hook Configuration

Located at `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged (only on src files)
echo "📝 Running lint on staged src files..."
npx lint-staged

# Run tests with coverage
echo "🧪 Running tests with coverage..."
npm run test:coverage

echo "✅ All pre-commit checks passed!"
```

### Bypassing Hooks (Emergency Only)

```bash
git commit --no-verify -m "Emergency commit"
```

⚠️ **Not recommended** - Use only in emergencies. CI will still enforce all checks.

## Troubleshooting

### Lint Check Failed

**Problem:** Code style violations detected by Biome

**Solution:**
```bash
# Check what's wrong
npm run lint

# Auto-fix most issues
npx biome check --write .

# Format all files
npx biome format --write .

# Both check and format
npx biome check --write . && npx biome format --write .
```

**Common fixes:**
- Template literal usage instead of string concatenation
- Consistent quote styles
- Missing/extra whitespace
- Unused imports or variables

### Tests Timing Out
If tests timeout, check for:
- Unmocked async operations
- Server instances not being cleaned up
- Missing mock implementations

### Low Coverage
To improve coverage:
1. Check `coverage/index.html` for uncovered lines
2. Add tests for missing branches
3. Test error scenarios
4. Ensure all exports are tested

### Module Resolution Issues
If imports fail:
- Check `tsconfig.json` paths
- Verify mock paths match actual imports
- Use `.js` extensions for ESM imports

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure coverage stays above **90%** (currently 100%)
3. Run `npm run test:coverage` before committing
4. Pre-commit hooks will automatically run and block commits if tests fail
5. Update this documentation if adding new testing patterns



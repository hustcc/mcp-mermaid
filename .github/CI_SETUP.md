# GitHub Actions CI/CD Setup Guide

## Overview

This project uses **GitHub Actions** for continuous integration and deployment. The CI pipeline automatically runs quality checks on every push and pull request to ensure code quality, test coverage, and build integrity.

## Quick Start

**TL;DR:** Push your code, and CI will automatically:
1. ✅ Lint your code
2. ✅ Run all tests with coverage
3. ✅ Enforce 90% coverage minimum
4. ✅ Build the project
5. ✅ Upload coverage reports

## Workflow Configuration

**File:** `.github/workflows/ci.yml`

### Triggers

The CI pipeline runs on:
- **Push** to `main`, `master`, or `develop` branches
- **Pull requests** targeting these branches

```yaml
on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]
```

## Jobs Overview

### 1. Lint and Test Coverage

**Runs on:** Ubuntu Latest  
**Node versions:** 18.x, 20.x (matrix strategy)

#### Steps:

1. **Checkout Code**
   ```yaml
   - uses: actions/checkout@v4
   ```
   Clones your repository code

2. **Setup Node.js**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version: ${{ matrix.node-version }}
       cache: 'npm'
   ```
   - Installs Node.js (18.x and 20.x)
   - Caches npm dependencies for faster builds

3. **Install Dependencies**
   ```bash
   npm ci
   ```
   - Clean install (faster than `npm install`)
   - Uses `package-lock.json` for exact versions
   - Installs Playwright with dependencies

4. **Run Lint Check**
   ```bash
   npm run lint
   ```
   - Validates code style with Biome
   - Checks only `src/` files
   - **Fails** if any lint errors

5. **Run Tests with Coverage**
   ```bash
   npm run test:coverage
   ```
   - Executes all 169 tests
   - Generates coverage reports (HTML, LCOV, JSON)
   - **Fails** if any test fails

6. **Check Coverage Threshold (90%)**
   - Custom Node.js script that reads `coverage/coverage-final.json`
   - Calculates coverage for:
     - Statements
     - Branches
     - Functions
     - Lines
   - **Fails build** if ANY metric < 90%
   
   Output example:
   ```
   📊 Coverage Report:
     Statements: 100.00%
     Branches:   100.00%
     Functions:  100.00%
     Lines:      100.00%
   
   ✅ All coverage metrics meet the 90% threshold!
   ```

7. **Upload to CodeCov** (Node 20.x only) - **OPTIONAL**
   ```yaml
   - uses: codecov/codecov-action@v4
     if: matrix.node-version == '20.x' && env.CODECOV_TOKEN != ''
     with:
       files: ./coverage/lcov.info
   ```
   - Only runs if `CODECOV_TOKEN` secret is configured
   - Skipped if no token is present
   - Won't fail the build if upload fails
   - Optional but recommended for coverage tracking

8. **Upload Coverage Artifact**
   - Saves coverage reports as GitHub artifact
   - Retention: 30 days
   - Accessible from Actions tab

### 2. Build Check

**Runs on:** Ubuntu Latest  
**Node version:** 20.x  
**Depends on:** Lint and Test job must pass first

#### Steps:

1. **Checkout Code**
2. **Setup Node.js 20.x**
3. **Install Dependencies**
4. **Build Project**
   ```bash
   npm run build
   ```
   - Compiles TypeScript to JavaScript
   - Runs `tsc` and `tsc-alias`
   - **Fails** if compilation errors

5. **Upload Build Artifact**
   - Saves build output
   - Retention: 7 days

## Coverage Threshold Enforcement

The pipeline includes a strict 90% coverage check:

```javascript
// Pseudo-code of the check
for each metric in [statements, branches, functions, lines]:
  if (coverage < 90%):
    console.error('❌ Coverage below 90%')
    exit(1)  // Fail the build
```

### Why 90%?

- Ensures high code quality
- Catches untested code paths
- Prevents coverage regression
- Industry best practice

## CI Pipeline Flow

```
┌─────────────────┐
│  Push/PR        │
└────────┬────────┘
         ↓
┌─────────────────────────────────┐
│  Lint & Test (Node 18.x, 20.x) │
├─────────────────────────────────┤
│  1. npm run lint                │
│  2. npm run test:coverage       │
│  3. Check coverage ≥ 90%        │
│  4. Upload to CodeCov           │
│  5. Save artifacts              │
└────────┬────────────────────────┘
         ↓
    ✅ Both pass?
         ↓
┌─────────────────────┐
│  Build Check        │
├─────────────────────┤
│  1. npm run build   │
│  2. Save artifacts  │
└─────────────────────┘
         ↓
    ✅ Success!
```

## Artifacts

### Coverage Reports (30-day retention)

- **HTML Report:** `coverage/index.html`
- **LCOV Data:** `coverage/lcov.info`
- **JSON Data:** `coverage/coverage-final.json`

**To download:**
1. Go to Actions tab
2. Click on workflow run
3. Scroll to "Artifacts" section
4. Download "coverage-report"

### Build Output (7-day retention)

- Compiled JavaScript files
- Type definitions (`.d.ts`)
- Source maps

## Setting Up CodeCov (Optional)

**Note:** CodeCov integration is completely optional. The CI pipeline will work fine without it. Coverage reports are still generated and saved as GitHub artifacts.

If you want to enable CodeCov for coverage tracking over time:

1. **Create CodeCov Account**
   - Visit https://codecov.io
   - Sign in with GitHub
   - Select your repository

2. **Get Your Token**
   - Copy the CODECOV_TOKEN from settings

3. **Add to GitHub Secrets**
   - Go to repo Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: Your token
   - Click "Add secret"

4. **Benefits** (if you choose to use it)
   - Coverage trend graphs
   - PR coverage comments
   - Coverage badges
   - Team notifications

**Without CodeCov:**
- ✅ Coverage reports still generated locally
- ✅ Coverage artifacts saved for 30 days
- ✅ Coverage checks still enforce 90% threshold
- ✅ CI pipeline runs normally

## Branch Protection Rules

To require CI checks before merging:

1. **Navigate to Settings**
   - Repo → Settings → Branches

2. **Add Protection Rule**
   - Branch name pattern: `main` (or `master`)
   - Enable "Require status checks to pass before merging"

3. **Select Required Checks**
   - ✅ `Lint & Test Coverage (18.x)`
   - ✅ `Lint & Test Coverage (20.x)`
   - ✅ `Build Check`

4. **Additional Options** (Recommended)
   - ✅ Require branches to be up to date
   - ✅ Require linear history
   - ✅ Include administrators

## Local Testing Before Push

Run the same checks locally to catch issues early:

```bash
# 1. Lint check
npm run lint

# 2. Fix lint issues (if any)
npm run lint:fix

# 3. Run tests with coverage
npm run test:coverage

# 4. Verify coverage is ≥ 90%
# Open coverage/index.html in browser

# 5. Build the project
npm run build

# If all pass, you're good to push! 🚀
git push
```

## Viewing CI Results

### In Pull Requests

- **Bottom of PR page:** Status checks section
  - ✅ Green = Passed
  - ❌ Red = Failed (click "Details" to see why)
  - 🟡 Yellow = Running
  - ⚪ Gray = Queued/Skipped

### In Actions Tab

1. Click "Actions" tab in GitHub
2. See all workflow runs
3. Click on a run for details
4. Expand steps to see logs
5. Download artifacts

### Status Badge

Add to your README.md:

```markdown
[![CI](https://github.com/hustcc/mcp-mermaid/actions/workflows/ci.yml/badge.svg)](https://github.com/hustcc/mcp-mermaid/actions/workflows/ci.yml)
```

## Troubleshooting

### ❌ Lint Check Failed

**Problem:** Code style violations

**Solution:**
```bash
npm run lint          # See errors
npm run lint:fix      # Auto-fix
git add .
git commit -m "fix: lint errors"
git push
```

### ❌ Tests Failed

**Problem:** One or more tests failing

**Solution:**
```bash
npm test                # Run tests
npm run test:watch      # Debug in watch mode

# Fix the failing tests
git add .
git commit -m "fix: failing tests"
git push
```

### ❌ Coverage Below 90%

**Problem:** Insufficient test coverage

**Solution:**
```bash
npm run test:coverage

# Open coverage/index.html to see uncovered lines
# Add tests for uncovered code

git add .
git commit -m "test: increase coverage to 90%"
git push
```

### ❌ Build Failed

**Problem:** TypeScript compilation errors

**Solution:**
```bash
npm run build

# Fix TypeScript errors
# Common issues:
# - Type mismatches
# - Missing imports
# - Syntax errors

git add .
git commit -m "fix: TypeScript errors"
git push
```

### ⚠️ "npm ci" Failed

**Problem:** Dependency installation failed

**Solutions:**
- Ensure `package-lock.json` is committed
- Verify Node version compatibility
- Check for platform-specific dependencies
- Clear cache and regenerate lock file:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  git add package-lock.json
  git commit -m "chore: regenerate package-lock"
  ```

### 📦 Playwright Installation Failed

**Problem:** Playwright browser download issues

**Solution:**
- CI automatically runs `playwright install --with-deps chromium`
- If fails, check Playwright version compatibility
- Verify network connectivity in CI environment

## Skipping CI (Not Recommended)

To skip CI for documentation-only changes:

```bash
git commit -m "docs: update readme [skip ci]"
```

**⚠️ Use sparingly!** Only for:
- README updates
- Documentation fixes
- Comment changes
- Non-code files

## CI Performance

### Typical Execution Times

| Job | Node 18.x | Node 20.x |
|-----|-----------|-----------|
| Lint | ~5s | ~5s |
| Tests | ~10s | ~10s |
| Coverage Check | ~1s | ~1s |
| Upload | ~3s | ~3s |
| **Total** | **~25s** | **~25s** |

| Job | Time |
|-----|------|
| Build Check | ~15s |

**Total Pipeline:** ~30-40 seconds

### Optimizations

- ✅ npm cache enabled
- ✅ Parallel matrix jobs (18.x & 20.x run simultaneously)
- ✅ CodeCov upload only on Node 20.x
- ✅ Artifacts only saved once

## Debugging CI Failures

### Enable Debug Logging

Add to your workflow:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

### Re-run Failed Jobs

1. Go to failed workflow run
2. Click "Re-run jobs" dropdown
3. Select "Re-run failed jobs"

### Access Logs

1. Click on failed job
2. Expand the failed step
3. Review error messages
4. Look for stack traces

## Updating the Workflow

To modify CI checks:

1. **Edit** `.github/workflows/ci.yml`
2. **Test locally** if possible
3. **Push to feature branch**
4. **Create PR** to verify changes
5. **Review CI results** before merging

### Common Modifications

**Add new Node version:**
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # Add 22.x
```

**Add environment variables:**
```yaml
env:
  NODE_ENV: test
  CI: true
```

**Add new step:**
```yaml
- name: Run E2E tests
  run: npm run test:e2e
```

## Best Practices

1. ✅ **Run checks locally** before pushing
2. ✅ **Fix issues immediately** when CI fails
3. ✅ **Don't merge** with failing CI
4. ✅ **Keep coverage** above 90%
5. ✅ **Update lock file** when adding dependencies
6. ✅ **Write meaningful** commit messages
7. ✅ **Review logs** when debugging
8. ❌ **Don't skip CI** unless absolutely necessary

## Security Considerations

### Secrets

- Never commit tokens/credentials
- Use GitHub Secrets for sensitive data
- Rotate tokens regularly

### Dependencies

- Review dependency updates
- Use `npm audit` to check vulnerabilities
- Keep dependencies up to date

### Permissions

The workflow has default permissions:
- Read repository contents
- Write to Actions artifacts
- No write access to code

## Support

### Getting Help

- 📖 Read this guide thoroughly
- 🐛 Check GitHub Actions logs
- 💬 Open issue if CI consistently fails
- 📧 Contact maintainers

### Useful Links

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vitest Documentation](https://vitest.dev)
- [CodeCov Documentation](https://docs.codecov.com)
- [Biome Linter](https://biomejs.dev)

## Summary

✅ **Automated quality checks** on every push/PR  
✅ **90% coverage enforcement** prevents regression  
✅ **Multi-version testing** ensures compatibility  
✅ **Fast feedback** (~30-40 seconds total)  
✅ **Detailed reports** via artifacts and CodeCov  
✅ **Branch protection** prevents bad merges  

**The CI pipeline ensures every commit meets our quality standards!** 🚀

---

**Last Updated:** November 20, 2025  
**Workflow File:** `.github/workflows/ci.yml`  
**Questions?** See [Contributing Guide](../CONTRIBUTING.md)

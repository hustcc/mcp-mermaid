# Quick CI Reference

## What Runs on Push/PR

```bash
1. npm run lint              # Code style check
2. npm run test:coverage     # Run all 169 tests
3. Coverage check ≥ 90%      # Enforce threshold
4. npm run build             # Build verification
```

## CI Status Meanings

- ✅ **Green Check** - All passed, ready to merge
- ❌ **Red X** - Failed, needs fixing
- 🟡 **Yellow Dot** - Running, please wait
- ⚪ **Gray Dot** - Queued or skipped

## Quick Fixes

### Lint Failed
```bash
npm run lint:fix
git add .
git commit -m "fix: lint errors"
git push
```

### Tests Failed
```bash
npm test
# Fix the failing tests
git add .
git commit -m "fix: failing tests"
git push
```

### Coverage < 90%
```bash
npm run test:coverage
# Check coverage/index.html
# Add tests for uncovered lines
git add .
git commit -m "test: increase coverage"
git push
```

### Build Failed
```bash
npm run build
# Fix TypeScript errors
git add .
git commit -m "fix: build errors"
git push
```

## Local Pre-Push Checklist

```bash
✓ npm run lint              # Passes?
✓ npm run test:coverage     # All green?
✓ Coverage ≥ 90%?           # Check report
✓ npm run build             # Compiles?
```

If all ✓, you're good to push! 🚀

## View CI Results

- **PR Page** - See check status at bottom
- **Actions Tab** - View detailed logs
- **Artifacts** - Download coverage reports

## CI Workflow Location

`.github/workflows/ci.yml`

## Need Help?

See [CI Setup Guide](.github/CI_SETUP.md) for detailed information.


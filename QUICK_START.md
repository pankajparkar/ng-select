# Quick Start Guide - Vitest Migration

## ✅ Migration Complete!

Your ng-select project has been successfully migrated to **Vitest with Browser Mode**.

## ⚠️ IMPORTANT: Node.js 22 Required

Vitest 4.x with Vite 7.x **requires Node.js 22+**. You'll get `crypto.hash is not a function` error on older versions.

## 🚀 Quick Start

### 1. Switch to Node.js 22 (REQUIRED!)

```bash
# Check if you have Node 22
nvm install 22

# Switch to Node 22
nvm use 22

# Verify you're on Node 22
node --version
# Should show: v22.x.x
```

**Note**: The `.nvmrc` file has been created, so you can simply run:
```bash
nvm use
```

### 2. Install Playwright Browsers (One-time setup)

```bash
npx playwright install chromium
```

### 3. Run Your Tests!

```bash
# Run all tests
pnpm test

# Run in watch mode with UI (great for debugging!)
pnpm test:watch

# Run your specific failing test
pnpm vitest src/ng-select/lib/ng-select.component.spec.ts --grep "should update ng-option label after async change"
```

## 🎯 Why This Fixes `afterEveryRender()`

Your test was failing because:
- ❌ Jasmine's `fakeAsync` doesn't execute `afterEveryRender()` callbacks
- ❌ Karma runs in a simulated environment

Vitest Browser Mode fixes this:
- ✅ Tests run in a **real Chromium browser**
- ✅ `afterEveryRender()` executes properly
- ✅ Accurate browser environment

## 📁 What Changed?

- ✅ [package.json](package.json) - Added Vitest dependencies and scripts
- ✅ [vitest.config.ts](vitest.config.ts) - Complete Vitest configuration
- ✅ [.nvmrc](.nvmrc) - Specifies Node 22
- ✅ [src/ng-select/test-setup.ts](src/ng-select/test-setup.ts) - Angular testing environment
- ✅ TypeScript configs updated to use `vitest/globals`

## 🐛 Troubleshooting

### "crypto.hash is not a function"
You're using Node.js < 22. Run:
```bash
nvm use 22
```

### "vitest: command not found"
Dependencies aren't installed. Run:
```bash
pnpm install
```

### "No test suite found in file"
The Angular plugin needs proper setup. This should work out of the box, but if you see this:
```bash
# Clean reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📚 Full Documentation

For complete details, see [VITEST_MIGRATION.md](VITEST_MIGRATION.md).

## ✨ What's Next?

1. Run your tests with `pnpm test`
2. Verify the `afterEveryRender()` test passes
3. Update your CI/CD to use Node 22
4. Remove Karma/Jasmine after all tests pass (optional)

Happy testing! 🎉

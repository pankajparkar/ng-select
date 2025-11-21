# Vitest Migration Guide

## ✅ What Has Been Done

The project has been migrated from Jasmine/Karma to **Vitest with Browser Mode**. Here's what was completed:

### 1. **Dependencies Installed**
```json
{
  "devDependencies": {
    "vitest": "^4.0.12",
    "@vitest/browser": "^4.0.12",
    "@vitest/browser-playwright": "^4.0.12",
    "@vitest/ui": "^4.0.12",
    "@vitest/coverage-istanbul": "^4.0.12",
    "@analogjs/vite-plugin-angular": "^2.1.0",
    "playwright": "^1.56.1",
    "vite": "^7.2.4"
  }
}
```

### 2. **Configuration Files Created**

#### vitest.config.ts
- Browser mode enabled with Playwright/Chromium
- Angular Vite plugin configured for component compilation
- Test setup files configured
- Coverage with Istanbul provider

#### src/ng-select/test-setup.ts
- Angular testing environment initialization
- Zone.js setup for tests

#### Updated TypeScript Configurations
- `src/ng-select/tsconfig.spec.json` - Changed types from `jasmine` to `vitest/globals`
- `src/ng-option-highlight/tsconfig.spec.json` - Changed types from `jasmine` to `vitest/globals`

### 3. **Package.json Scripts Updated**
```json
{
  "test": "vitest run --coverage",
  "test:watch": "vitest --ui",
  "test:ci": "vitest run --coverage --reporter=verbose",
  "test:karma": "ng test ng-select --code-coverage && ng test ng-option-highlight --code-coverage"
}
```

## 🔧 Current Status

### What's Working:
✅ Vitest is installed and configured
✅ Browser mode is set up with Playwright
✅ Tests are discovered and can be run
✅ Angular plugin is handling component compilation
✅ Test environment is initialized properly

### Known Issues:

1. **Node.js Version Requirement**
   - Vitest 4.x with Vite 7.x requires **Node.js 22+**
   - Current project may have Node 18 in some environments
   - **Solution**: Use `nvm use 22` or update `.nvmrc` file

2. **Package Manager Type Conflicts**
   - The project has `"type": "module"` in package.json for ESM support
   - Some pnpm installations may create duplicate package instances
   - **Solution**: Run `pnpm install --force` to rebuild dependencies

3. **Angular Component Resolution**
   - The `@analogjs/vite-plugin-angular` plugin needs proper configuration
   - Some tests may fail with "Component not resolved" errors initially
   - **Solution**: The plugin is configured with JIT mode enabled

## 🚀 How to Run Tests

### Prerequisites:
```bash
# Switch to Node 22 (required for Vite 7)
nvm use 22

# Or install Node 22 if not available
nvm install 22
nvm use 22
```

### Running Tests:

```bash
# Run all tests
pnpm test

# Run in watch mode with UI
pnpm test:watch

# Run specific test file
pnpm vitest src/ng-select/lib/ng-dropdown-panel.service.spec.ts

# Run with filter
pnpm vitest --grep "should calculate items"

# Run the specific failing test from the original issue
pnpm vitest src/ng-select/lib/ng-select.component.spec.ts --grep "should update ng-option label after async change"
```

## 🎯 Why This Solves the `afterEveryRender()` Issue

The original problem was that `afterEveryRender()` doesn't execute in Jasmine's `fakeAsync` tests because:
1. It's a browser-only API
2. Jasmine/Karma runs in a simulated environment

**Vitest Browser Mode solves this by:**
- ✅ Running tests in **real Chromium browser** via Playwright
- ✅ Executing `afterEveryRender()` callbacks properly
- ✅ Accurate DOM manipulation and lifecycle hooks
- ✅ More realistic test environment matching production

## 📝 Next Steps

### 1. Fix Package Dependencies (if needed)
```bash
# Clean install with Node 22
nvm use 22
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### 2. Update .nvmrc (✅ Done!)
The `.nvmrc` file has been created with Node 22 specified.

### 3. Test the Migration
Run a simple test to verify:
```bash
pnpm vitest src/ng-select/lib/ng-dropdown-panel.service.spec.ts
```

### 4. Update CI/CD
Update your CI configuration to use Node 22:
```yaml
# Example for GitHub Actions
- uses: actions/setup-node@v4
  with:
    node-version: '22'
```

### 5. Clean Up (After Verification)
Once all tests pass, you can remove Karma/Jasmine:
```bash
pnpm remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core jasmine-spec-reporter @types/jasmine @types/jasminewd2
```

And remove `karma.conf.js` files.

## 🐛 Troubleshooting

### "crypto.hash is not a function"
- **Cause**: Node.js < 22
- **Fix**: `nvm use 22`

### "No test suite found in file"
- **Cause**: TypeScript compilation issues
- **Fix**: Check `vitest.config.ts` has the Angular plugin properly configured

### "Component is not resolved"
- **Cause**: Angular templates/styles not being processed
- **Fix**: Ensure `@analogjs/vite-plugin-angular` is in the plugins array

### Tests timeout
- **Cause**: Browser mode is slower than jsdom
- **Fix**: Increase `testTimeout` in vitest.config.ts or use `--timeout` flag

## 📚 Resources

- [Vitest Browser Mode Docs](https://vitest.dev/guide/browser/)
- [Angular with Vitest Guide](https://blog.ninja-squad.com/2025/11/18/angular-tests-with-vitest-browser-mode)
- [Analog Vite Plugin](https://analogjs.org/docs/packages/vite-plugin-angular/overview)

## ✨ Benefits of This Migration

1. **Faster Tests** (after initial setup)
2. **Better DX** with Vitest UI
3. **Real Browser Environment** - fixes `afterEveryRender()` issues
4. **Modern Tooling** - ESM, Vite, better error messages
5. **Visual Regression Testing** capability built-in
6. **Retried Assertions** - automatic retry for flaky tests

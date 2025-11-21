import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { playwright } from '@vitest/browser-playwright';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
	plugins: [
		angular({
			tsconfig: resolve(__dirname, 'tsconfig.json'),
			jit: true,
			supportedBrowsers: ['chrome'],
		}),
	],
	test: {
		// Use browser mode for real browser testing (supports afterEveryRender)
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [
				{ browser: 'chromium' }
			],
			headless: true,
			screenshotFailures: false,
		},
		// Test setup files
		setupFiles: ['./src/ng-select/test-setup.ts'],
		// Include test files
		include: ['src/**/*.spec.ts'],
		// Globals for compatibility with Jasmine-style tests
		globals: true,
		// Coverage configuration (using istanbul for browser mode compatibility)
		coverage: {
			enabled: false, // Disable for now to simplify debugging
			provider: 'istanbul',
			reporter: ['html', 'lcov', 'text-summary'],
			reportsDirectory: './coverage',
			include: ['src/ng-select/lib/**/*.ts', 'src/ng-option-highlight/lib/**/*.ts'],
			exclude: [
				'src/ng-select/testing/*',
				'src/ng-select/*.ts',
				'src/ng-select/lib/console.service.ts',
				'src/ng-select/lib/search-helper.ts',
				'src/ng-select/lib/ng-templates.directive.ts',
				'**/*.spec.ts',
				'**/*.d.ts',
			],
		},
		// Test timeout
		testTimeout: 10000,
		// Retry failed tests once (useful for flaky tests)
		retry: 1,
	},
	resolve: {
		alias: {
			'@ng-select/ng-select': resolve(__dirname, 'src/ng-select/public-api.ts'),
			'@ng-select/ng-option-highlight': resolve(__dirname, 'src/ng-option-highlight/public-api.ts'),
		},
	},
});

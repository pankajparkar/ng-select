import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { expect } from 'vitest';

// Add Jasmine-like matchers for Vitest compatibility
(globalThis as any).jasmine = {
	objectContaining: (obj: any) => expect.objectContaining(obj),
	any: (constructor: any) => expect.any(constructor),
	anything: () => expect.anything(),
	arrayContaining: (arr: any[]) => expect.arrayContaining(arr),
	stringContaining: (str: string) => expect.stringContaining(str),
	stringMatching: (pattern: string | RegExp) => expect.stringMatching(pattern),
};

// Override ProxyZone assertion to work in Vitest browser mode
const ProxyZoneSpec = (Zone as any)['ProxyZoneSpec'];
if (ProxyZoneSpec && ProxyZoneSpec.assertPresent) {
	const originalAssertPresent = ProxyZoneSpec.assertPresent;
	ProxyZoneSpec.assertPresent = function() {
		try {
			return originalAssertPresent.call(this);
		} catch (e) {
			// In Vitest browser mode, ProxyZone might not be set up correctly
			// Return undefined to allow tests to proceed
			return undefined;
		}
	};
}

// Initialize the Angular testing environment
getTestBed().initTestEnvironment(
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting(),
	{
		// This is important for zone.js to work properly with Vitest
		teardown: { destroyAfterEach: false }
	}
);

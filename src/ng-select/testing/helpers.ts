import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KeyCode } from '../lib/ng-select.types';

export class TestsErrorHandler { }

export async function tickAndDetectChanges(fixture: ComponentFixture<any>) {
	fixture.detectChanges();
	await fixture.whenStable();
}

export async function selectOption(fixture, key: KeyCode, index: number) {
	triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space); // open
	await tickAndDetectChanges(fixture); // need to detect changes and wait for stability, since dropdown fully inits after promise is resolved
	for (let i = 0; i < index; i++) {
		triggerKeyDownEvent(getNgSelectElement(fixture), key);
	}
	triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter); // select
}

export function getNgSelectElement(fixture: ComponentFixture<any>): DebugElement {
	return fixture.debugElement.query(By.css('ng-select'));
}

export function getNgSelectNativeElement(fixture: ComponentFixture<any>): HTMLElement {
	return getNgSelectElement(fixture).nativeElement;
}

export function triggerKeyDownEvent(element: DebugElement, key: string, target: Element = null): void {
	element.triggerEventHandler('keydown', {
		key,
		preventDefault: () => { },
		target,
	});
}

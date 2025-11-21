import { vi } from 'vitest';
import { Component, DebugElement, ErrorHandler, NgZone, Type, ViewEncapsulation, viewChild } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import 'zone.js/testing';
import { getNgSelectElement, getNgSelectNativeElement, selectOption, TestsErrorHandler, tickAndDetectChanges, triggerKeyDownEvent } from '../testing/helpers';
import { MockConsole, MockNgZone } from '../testing/mocks';
import { NgSelectConfig } from './config.service';
import { ConsoleService } from './console.service';
import { AddTagFn, NgSelectComponent } from './ng-select.component';
import { NgSelectModule } from './ng-select.module';
import { KeyCode, NgOption } from './ng-select.types';
import { SIGNAL } from '@angular/core/primitives/signals';

describe('NgSelectComponent', () => {

	const selectTypes = [
		{ name: 'single', classContains: 'ng-select-single', classNotContains: 'ng-select-multiple', isMultiple: false },
		{ name: 'multiple', classContains: 'ng-select-multiple', classNotContains: 'ng-select-single', isMultiple: true },
	];

	selectTypes.forEach(({ name, classContains, classNotContains, isMultiple }) => {
		describe(`Check class existence of classes on ${name} select scenario`, () => {
			let fixture: ComponentFixture<NgSelectTestComponent>;
			let componentInstance: NgSelectTestComponent;

			beforeEach(() => {
				fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [typeahead]="typeahead"
						[multiple]="${isMultiple}"
						[clearable]="clearable"
						[searchable]="searchable"
						[readonly]="readonly"
						[addTag]="addTag" />`);
				componentInstance = fixture.componentInstance;
				fixture.detectChanges();

				// set default values
				componentInstance.searchable = false;
				componentInstance.clearable = false;
				fixture.detectChanges();
			});

			it('should have ng-select class on host element', () => {
				const ngSelectEl = getNgSelectNativeElement(fixture);
				expect(ngSelectEl).toHaveClass('ng-select');
				expect(ngSelectEl).toHaveClass(classContains);

				expect(ngSelectEl).not.toHaveClass(classNotContains);
				expect(ngSelectEl).not.toHaveClass('ng-select-typeahead');
				expect(ngSelectEl).not.toHaveClass('ng-select-taggable');
				expect(ngSelectEl).not.toHaveClass('ng-select-searchable');
				expect(ngSelectEl).not.toHaveClass('ng-select-clearable');
				expect(ngSelectEl).not.toHaveClass('ng-select-opened');
				expect(ngSelectEl).not.toHaveClass('ng-select-filtered');
				expect(ngSelectEl).not.toHaveClass('ng-select-disabled');
			});

			it('should have ng-select-typeahead class when typeahead is true', () => {
				componentInstance.typeahead = true;
				fixture.detectChanges();

				const ngSelectEl = getNgSelectNativeElement(fixture);
				expect(ngSelectEl).toHaveClass('ng-select');
				expect(ngSelectEl).toHaveClass('ng-select-typeahead');
				expect(ngSelectEl).toHaveClass(classContains);

				expect(ngSelectEl).not.toHaveClass(classNotContains);
				expect(ngSelectEl).not.toHaveClass('ng-select-taggable');
				expect(ngSelectEl).not.toHaveClass('ng-select-searchable');
				expect(ngSelectEl).not.toHaveClass('ng-select-clearable');
				expect(ngSelectEl).not.toHaveClass('ng-select-opened');
				expect(ngSelectEl).not.toHaveClass('ng-select-filtered');
				expect(ngSelectEl).not.toHaveClass('ng-select-disabled');
			});

			it('should have appropriate ng-select-typeahead when taggable is true', () => {
				componentInstance.addTag = () => 'new tag';
				fixture.detectChanges();

				const ngSelectEl = getNgSelectNativeElement(fixture);
				expect(ngSelectEl).toHaveClass('ng-select');
				expect(ngSelectEl).toHaveClass('ng-select-taggable');
				expect(ngSelectEl).toHaveClass(classContains);

				expect(ngSelectEl).not.toHaveClass(classNotContains);
				expect(ngSelectEl).not.toHaveClass('ng-select-typeahead');
				expect(ngSelectEl).not.toHaveClass('ng-select-searchable');
				expect(ngSelectEl).not.toHaveClass('ng-select-clearable');
				expect(ngSelectEl).not.toHaveClass('ng-select-opened');
				expect(ngSelectEl).not.toHaveClass('ng-select-filtered');
				expect(ngSelectEl).not.toHaveClass('ng-select-disabled');
			});

			it('should have appropriate ng-select-typeahead when searchable is true', () => {
				componentInstance.searchable = true;
				fixture.detectChanges();

				const ngSelectEl = getNgSelectNativeElement(fixture);
				expect(ngSelectEl).toHaveClass('ng-select');
				expect(ngSelectEl).toHaveClass('ng-select-searchable');
				expect(ngSelectEl).toHaveClass(classContains);

				expect(ngSelectEl).not.toHaveClass(classNotContains);
				expect(ngSelectEl).not.toHaveClass('ng-select-typeahead');
				expect(ngSelectEl).not.toHaveClass('ng-select-taggable');
				expect(ngSelectEl).not.toHaveClass('ng-select-clearable');
				expect(ngSelectEl).not.toHaveClass('ng-select-opened');
				expect(ngSelectEl).not.toHaveClass('ng-select-filtered');
				expect(ngSelectEl).not.toHaveClass('ng-select-disabled');
			});

			it('should have appropriate ng-select-typeahead when clearable is true', () => {
				componentInstance.clearable = true;
				fixture.detectChanges();

				const ngSelectEl = getNgSelectNativeElement(fixture);
				expect(ngSelectEl).toHaveClass('ng-select');
				expect(ngSelectEl).toHaveClass('ng-select-clearable');
				expect(ngSelectEl).toHaveClass(classContains);

				expect(ngSelectEl).not.toHaveClass(classNotContains);
				expect(ngSelectEl).not.toHaveClass('ng-select-typeahead');
				expect(ngSelectEl).not.toHaveClass('ng-select-taggable');
				expect(ngSelectEl).not.toHaveClass('ng-select-searchable');
				expect(ngSelectEl).not.toHaveClass('ng-select-opened');
				expect(ngSelectEl).not.toHaveClass('ng-select-filtered');
				expect(ngSelectEl).not.toHaveClass('ng-select-disabled');
			});

			it('should have appropriate ng-select-typeahead when disabled is true', () => {
				componentInstance.readonly = true;
				fixture.detectChanges();

				const ngSelectEl = getNgSelectNativeElement(fixture);
				expect(ngSelectEl).toHaveClass('ng-select');
				expect(ngSelectEl).toHaveClass('ng-select-disabled');
				expect(ngSelectEl).toHaveClass(classContains);

				expect(ngSelectEl).not.toHaveClass(classNotContains);
				expect(ngSelectEl).not.toHaveClass('ng-select-typeahead');
				expect(ngSelectEl).not.toHaveClass('ng-select-taggable');
				expect(ngSelectEl).not.toHaveClass('ng-select-searchable');
				expect(ngSelectEl).not.toHaveClass('ng-select-opened');
				expect(ngSelectEl).not.toHaveClass('ng-select-filtered');
				expect(ngSelectEl).not.toHaveClass('ng-select-clearable');
			});
		});
	});

	describe('Data source', () => {
		it('should set items from primitive numbers array', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="[0, 30, 60, 90, 120, 180, 240]">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			const itemsList = fixture.componentInstance.select().itemsList;
			expect(itemsList.items.length).toBe(7);
			expect(itemsList.items[0]).toEqual(
				jasmine.objectContaining({
					label: '0',
					value: 0,
				}),
			);
		});

		it('should set items from array', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]=cities bindLabel="name">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			const itemsList = fixture.componentInstance.select().itemsList;
			expect(itemsList.items.length).toBe(3);
			expect(itemsList.items[0]).toEqual(
				jasmine.objectContaining({
					label: 'Vilnius',
					value: { id: 1, name: 'Vilnius' },
				}),
			);
		});

		it('should set items from readonly array', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]=readonlyCities bindLabel="name">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			const itemsList = fixture.componentInstance.select().itemsList;
			expect(itemsList.items.length).toBe(3);
			expect(itemsList.items[0]).toEqual(
				jasmine.objectContaining({
					label: 'Vilnius',
					value: { id: 1, name: 'Vilnius' },
				}),
			);
		});

		it('should create items from ng-option', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [(ngModel)]="selectedCity">
					<ng-option [value]="true">Yes</ng-option>
					<ng-option [value]="false">No</ng-option>
				</ng-select>`,
			);

			// First render
			fixture.detectChanges();
			await fixture.whenStable();

			// Wait for afterEveryRender to execute and update ng-option labels
			await new Promise(resolve => setTimeout(resolve, 100));

			// Second detectChanges to propagate signal updates to items list
			fixture.detectChanges();
			await fixture.whenStable();

			const items = fixture.componentInstance.select().itemsList.items;
			expect(items.length).toBe(2);
			expect(items[0]).toEqual(
				jasmine.objectContaining({
					label: 'Yes',
					value: true,
					disabled: false,
				}),
			);
			expect(items[1]).toEqual(
				jasmine.objectContaining({
					label: 'No',
					value: false,
					disabled: false,
				}),
			);
		});

		it('should create empty items list when initialized with null', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="null">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			const itemsList = fixture.componentInstance.select().itemsList;
			expect(itemsList.items.length).toBe(0);
		});
		it('should create empty items list when initialized with undefined', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="undefined">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			const itemsList = fixture.componentInstance.select().itemsList;
			expect(itemsList.items.length).toBe(0);
		});
	});

	describe('Model bindings and data changes', () => {
		let select: NgSelectComponent;

		it('should update ngModel on value change', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			await selectOption(fixture, KeyCode.ArrowDown, 1);
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.selectedCity).toEqual(jasmine.objectContaining(fixture.componentInstance.cities[1]));

			fixture.componentInstance.select().clearModel();
			fixture.detectChanges();
			await fixture.whenStable();

			expect(fixture.componentInstance.selectedCity).toEqual(null);
		});

		it('should update internal model on ngModel change', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.select().selectedItems).toEqual([
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[0],
				}),
			]);

			fixture.componentInstance.selectedCity = null;
			fixture.detectChanges();
			await fixture.whenStable();

			expect(fixture.componentInstance.select().selectedItems).toEqual([]);
		});

		it('should update internal model after it was toggled with @if()', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`
                @if (visible) {
                    <ng-select
                            [items]="cities"
                            bindLabel="name"
                            [clearable]="true"
                            [(ngModel)]="selectedCity">
                    </ng-select>
                }`,
			);

			// select first city
			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();

			// toggle to hide/show
			fixture.componentInstance.toggleVisible();
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.toggleVisible();
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.selectedCity = null;
			fixture.detectChanges();
			await fixture.whenStable();

			expect(fixture.componentInstance.select().selectedItems).toEqual([]);
		});

		it('should set items correctly after ngModel set first when bindValue is used', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        bindValue="id"
                        [clearable]="true"
                        [(ngModel)]="selectedCityId">
                </ng-select>`,
			);

			fixture.componentInstance.cities = [];
			fixture.componentInstance.selectedCityId = 7;
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
			fixture.detectChanges();
			await fixture.whenStable();

			select = fixture.componentInstance.select();
			expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
			expect(select.selectedItems).toEqual([
				jasmine.objectContaining({
					value: { id: 7, name: 'Pailgis' },
				}),
			]);
		});

		it('should set items correctly after ngModel set first when bindValue is not used', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.componentInstance.cities = [];
			fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
			fixture.detectChanges();
			await fixture.whenStable();

			select = fixture.componentInstance.select();
			expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
			expect(select.selectedItems).toEqual([
				jasmine.objectContaining({
					value: { id: 7, name: 'Pailgis' },
				}),
			]);
		});

		it('should set items correctly after ngModel set first when bindValue is used from NgSelectConfig', async () => {
			const config = new NgSelectConfig();
			config.bindValue = 'id';
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCityId">
                </ng-select>`,
				config,
			);

			fixture.componentInstance.cities = [];
			fixture.componentInstance.selectedCityId = 7;
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
			fixture.detectChanges();
			await fixture.whenStable();

			select = fixture.componentInstance.select();
			expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
			expect(select.selectedItems).toEqual([
				jasmine.objectContaining({
					value: { id: 7, name: 'Pailgis' },
				}),
			]);
		});

		it('should not apply global bindValue from NgSelectConfig if bindValue prop explicitly provided in template', async () => {
			const config = new NgSelectConfig();
			config.bindValue = 'globalbindvalue';
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        bindValue="id"
                        [clearable]="true"
                        [(ngModel)]="selectedCityId">
                </ng-select>`,
				config,
			);

			fixture.componentInstance.cities = [];
			fixture.componentInstance.selectedCityId = 7;
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
			fixture.detectChanges();
			await fixture.whenStable();

			select = fixture.componentInstance.select();
			expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
			expect(select.selectedItems).toEqual([
				jasmine.objectContaining({
					value: { id: 7, name: 'Pailgis' },
				}),
			]);
		});

		it('should bind whole object as value when bindValue prop is specified with empty string in template', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        bindValue=""
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.componentInstance.cities = [];
			fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
			fixture.detectChanges();
			await fixture.whenStable();

			select = fixture.componentInstance.select();
			expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
			expect(select.selectedItems).toEqual([
				jasmine.objectContaining({
					value: { id: 7, name: 'Pailgis' },
				}),
			]);
		});

		it('should map label correctly', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.componentInstance.cities = [{ label: 'Vilnius city', name: 'Vilnius' }];
			fixture.detectChanges();
			await fixture.whenStable();
			select = fixture.componentInstance.select();

			expect(select.itemsList.items[0].label).toBe('Vilnius');
		});

		it('should escape label', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.componentInstance.cities = [{ label: '<img src="azd" (error)="alert(1)" />', name: 'Vilnius' }];
			fixture.detectChanges();
			await fixture.whenStable();
			select = fixture.componentInstance.select();
			select.open();

			const options = fixture.debugElement.nativeElement.querySelectorAll('.ng-option');
			expect(options[0].innerText).toBe('<img src="azd" (error)="alert(1)" />');
		});

		it('should set items correctly after ngModel set first when typeahead and single select is used', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                    bindLabel="name"
                    [typeahead]="filter"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			select = fixture.componentInstance.select();
			fixture.componentInstance.selectedCity = { id: 1, name: 'Vilnius' };
			fixture.detectChanges();
			await fixture.whenStable();
			expect(select.selectedItems).toEqual([
				jasmine.objectContaining({
					label: 'Vilnius',
					value: { id: 1, name: 'Vilnius' },
				}),
			]);

			fixture.componentInstance.cities = [
				{ id: 1, name: 'Vilnius' },
				{ id: 2, name: 'Kaunas' },
				{
					id: 3,
					name: 'Pabrade',
				},
			];
			fixture.detectChanges();
			await fixture.whenStable();
			const vilnius = select.itemsList.items[0];
			expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
			expect(vilnius.selected).toBeTruthy();
		});

		it('should set items correctly after ngModel set first when typeahead and multi-select is used', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                    bindLabel="name"
                    [multiple]="true"
                    [typeahead]="filter"
                    placeholder="select value"
                    [(ngModel)]="selectedCities">
                </ng-select>`,
			);

			select = fixture.componentInstance.select();
			fixture.componentInstance.selectedCities = [
				{ id: 1, name: 'Vilnius' },
				{ id: 2, name: 'Kaunas' },
			];
			fixture.detectChanges();
			await fixture.whenStable();
			expect(select.selectedItems).toEqual([
				jasmine.objectContaining({
					label: 'Vilnius',
					value: { id: 1, name: 'Vilnius' },
				}),
				jasmine.objectContaining({ label: 'Kaunas', value: { id: 2, name: 'Kaunas' } }),
			]);

			fixture.componentInstance.cities = [
				{ id: 1, name: 'Vilnius' },
				{ id: 2, name: 'Kaunas' },
				{
					id: 3,
					name: 'Pabrade',
				},
			];
			fixture.detectChanges();
			await fixture.whenStable();
			const vilnius = select.itemsList.items[0];
			const kaunas = select.itemsList.items[1];
			expect(select.selectedItems[0]).toBe(vilnius);
			expect(vilnius.selected).toBeTruthy();
			expect(select.selectedItems[1]).toBe(kaunas);
			expect(kaunas.selected).toBeTruthy();
		});

		it('should set items correctly if there is no bindLabel', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select
                    [items]="cities"
                    [clearable]="true"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			const cities = [{ id: 7, name: 'Pailgis' }];
			fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.cities = [
				{ id: 1, name: 'Vilnius' },
				{ id: 2, name: 'Kaunas' },
			];
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.select().selectedItems[0]).toEqual(
				jasmine.objectContaining({
					value: cities[0],
				}),
			);
		});

		it('should bind ngModel object even if items are empty', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.componentInstance.cities = [];
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
			fixture.detectChanges();
			await fixture.whenStable();

			expect(fixture.componentInstance.select().selectedItems).toEqual([
				jasmine.objectContaining({
					value: { id: 7, name: 'Pailgis' },
					selected: true,
				}),
			]);
		});

		it('should bind ngModel simple value even if items are empty', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="citiesNames"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.componentInstance.cities = [];
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.selectedCity = <any>'Kaunas';
			fixture.detectChanges();
			await fixture.whenStable();

			expect(fixture.componentInstance.select().selectedItems).toEqual([
				jasmine.objectContaining({
					value: 'Kaunas',
					label: 'Kaunas',
					selected: true,
				}),
			]);
		});

		it('should preserve latest selected value when items are changing', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();

			const selectValue = fixture.componentInstance.select();
			fixture.componentInstance.select().select(selectValue.itemsList.items[1]);
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();

			expect(fixture.componentInstance.selectedCity).toEqual(fixture.componentInstance.cities[1]);

			selectValue.clearModel();
			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();

			expect(fixture.componentInstance.selectedCity).toBeNull();
		});

		it('should map selected items with items in dropdown', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			select = fixture.componentInstance.select();

			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();

			expect(fixture.componentInstance.selectedCity).toEqual(fixture.componentInstance.cities[0]);
			expect(select.itemsList.filteredItems[0].selected).toBeTruthy();
		});

		it('should keep selected item while setting new items and bindValue is incorrect', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        bindValue="value"
                        [clearable]="true"
                        [(ngModel)]="selectedCityId">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable(); // triggers write value

			select = fixture.componentInstance.select();
			select.select(select.itemsList.items[1]);
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();

			expect(select.selectedItems[0]).toEqual(
				jasmine.objectContaining({
					value: { id: 2, name: 'Kaunas' },
				}),
			);
		});

		it('should clear previous single select value when setting new model', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();

			const lastSelection: any = fixture.componentInstance.select().selectedItems[0];
			expect(lastSelection.selected).toBeTruthy();

			fixture.componentInstance.selectedCity = null;
			fixture.detectChanges();
			await fixture.whenStable();
			expect(lastSelection.selected).toBeFalsy();
		});

		it('should clear disabled selected values when setting new model', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [multiple]="true"
                        [clearable]="true"
                        [(ngModel)]="selectedCities">
                </ng-select>`,
			);

			const disabled = { ...fixture.componentInstance.cities[1], disabled: true };
			fixture.componentInstance.selectedCities = <any>[fixture.componentInstance.cities[0], disabled];
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.cities[1].disabled = true;
			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.selectedCities = [];
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.select().selectedItems).toEqual([]);
		});

		it('should clear previous selected value even if it is disabled', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.componentInstance.cities[0].disabled = true;
			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[1];
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.select().selectedItems.length).toBe(1);
		});

		it('should clear previous multiple select value when setting new model', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [multiple]="true"
                        [clearable]="true"
                        [(ngModel)]="selectedCities">
                </ng-select>`,
			);

			fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
			fixture.detectChanges();
			await fixture.whenStable();
			select = fixture.componentInstance.select();
			expect(select.selectedItems.length).toBe(1);

			fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[1]];
			fixture.detectChanges();
			await fixture.whenStable();
			expect(select.selectedItems.length).toBe(1);

			fixture.componentInstance.selectedCities = [];
			fixture.detectChanges();
			await fixture.whenStable();
			expect(select.selectedItems.length).toBe(0);
		});

		it('should not add selected items to new items list when [items] are changed', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [multiple]="true"
                        [clearable]="true"
                        [(ngModel)]="selectedCities">
                </ng-select>`,
			);

			fixture.componentInstance.selectedCities = fixture.componentInstance.cities.slice(0, 2);
			fixture.detectChanges();
			await fixture.whenStable();

			fixture.componentInstance.cities = [{ id: 1, name: 'New city' }];
			fixture.detectChanges();
			await fixture.whenStable();

			const internalItems = fixture.componentInstance.select().itemsList.items;
			expect(internalItems.length).toBe(1);
			expect(internalItems[0].value).toEqual(jasmine.objectContaining({ id: 1, name: 'New city' }));
		});

		it('should reset marked item when [items] are changed and dropdown is opened', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);
			select = fixture.componentInstance.select();

			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[2];
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
			expect(fixture.componentInstance.select().itemsList.markedItem.value).toEqual({ name: 'Pabrade', id: 3 });

			fixture.componentInstance.selectedCity = { name: 'New city', id: 5 };
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.select().itemsList.markedItem.value).toEqual({ name: 'Vilnius', id: 1 });
		});

		it('should bind to custom object properties', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            [(ngModel)]="selectedCityId">
                </ng-select>`,
			);

			await selectOption(fixture, KeyCode.ArrowDown, 0);
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.selectedCityId).toEqual(1);

			fixture.componentInstance.selectedCityId = 2;
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.select().selectedItems).toEqual([
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[1],
				}),
			]);
		});

		it('should bind to nested label property', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="countries"
                            bindLabel="description.name"
                            [(ngModel)]="selectedCountry">
                </ng-select>`,
			);

			await selectOption(fixture, KeyCode.ArrowDown, 1);
			fixture.detectChanges();
			expect(fixture.componentInstance.select().selectedItems).toEqual([
				jasmine.objectContaining({
					label: 'USA',
					value: fixture.componentInstance.countries[1],
				}),
			]);

			fixture.componentInstance.selectedCountry = fixture.componentInstance.countries[0];
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.select().selectedItems).toEqual([
				jasmine.objectContaining({
					label: 'Lithuania',
					value: fixture.componentInstance.countries[0],
				}),
			]);
		});

		it('should bind to nested value property', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="countries"
                            bindLabel="description.name"
                            bindValue="description.id"
                            [(ngModel)]="selectedCountry">
                </ng-select>`,
			);

			await selectOption(fixture, KeyCode.ArrowDown, 1);
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.selectedCountry).toEqual('b');

			fixture.componentInstance.selectedCountry = fixture.componentInstance.countries[2].description.id;
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.select().selectedItems).toEqual([
				jasmine.objectContaining({
					label: 'Australia',
					value: fixture.componentInstance.countries[2],
				}),
			]);

			await selectOption(fixture, KeyCode.ArrowUp, 1);
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.selectedCountry).toEqual('b');
		});

		it('should bind to simple array', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="citiesNames"
                            [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			await selectOption(fixture, KeyCode.ArrowDown, 0);
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.selectedCity).toBe(<any>'Vilnius');
			fixture.componentInstance.selectedCity = <any>'Kaunas';
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.select().selectedItems).toEqual([
				jasmine.objectContaining({
					label: 'Kaunas',
					value: 'Kaunas',
				}),
			]);
		});

		it('should bind to object', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                            bindLabel="name"
                            [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			// from component to model
			await selectOption(fixture, KeyCode.ArrowDown, 0);
			fixture.detectChanges();
			await fixture.whenStable();
			expect(fixture.componentInstance.selectedCity).toEqual(fixture.componentInstance.cities[0]);

			// from model to component
			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[1];
			fixture.detectChanges();
			await fixture.whenStable();

			expect(fixture.componentInstance.select().selectedItems).toEqual([
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[1],
				}),
			]);
		});

		it('should use bindLabel from NgSelectConfig when bindLabel is not provided in template', async () => {
			const config = new NgSelectConfig();
			config.bindLabel = 'name';
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
				config,
			);

			fixture.componentInstance.cities = [{ id: 1, name: 'Vilnius', label: '' }];
			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();

			select = fixture.componentInstance.select();
			expect(select.selectedItems).toEqual([
				jasmine.objectContaining({
					label: 'Vilnius',
				}),
			]);
		});

		it('should override bindLabel from NgSelectConfig by template-provided bindLabel property', async () => {
			const config = new NgSelectConfig();
			config.bindLabel = 'label';
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
				config,
			);

			fixture.componentInstance.cities = [{ id: 1, name: 'Vilnius', label: 'the capital of Lithuania' }];
			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();

			select = fixture.componentInstance.select();
			expect(select.selectedItems).toEqual([
				jasmine.objectContaining({
					label: 'Vilnius',
				}),
			]);
		});

		it('should bind option label to "label" property when bindLabel is not provided', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.componentInstance.cities = [{ id: 1, name: 'Vilnius', label: 'the capital of Lithuania' }];
			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();

			select = fixture.componentInstance.select();
			expect(select.selectedItems).toEqual([
				jasmine.objectContaining({
					label: 'the capital of Lithuania',
				}),
			]);
		});

		describe('ng-option', () => {
			it('should reset to empty array', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [(ngModel)]="selectedCityId">
                        @for (city of cities; track city) {
                            <ng-option [value]="city.id">{{city.name}}</ng-option>
                        }
                    </ng-select>`,
				);

				select = fixture.componentInstance.select();
				fixture.detectChanges();
				await fixture.whenStable();
				expect(select.itemsList.items.length).toEqual(3);

				fixture.componentInstance.cities = [];
				fixture.detectChanges();
				await fixture.whenStable();
				expect(select.itemsList.items.length).toEqual(0);
			});

			it('should update ng-option when updated asynchronously', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [(ngModel)]="selectedCityId">
                        @for (city of cities; track city) {
                            <ng-option [value]="city.id">{{city.name}}</ng-option>
                        }
                    </ng-select>`,
				);
				select = fixture.componentInstance.select();
				expect(select.items().length).toEqual(3);

				fixture.componentInstance.cities = [
					{ id: 1, name: 'Vilnius' },
					{ id: 2, name: 'Kaunas' },
				];
				fixture.detectChanges();
				await fixture.whenStable();
				expect(select.items().length).toEqual(2);
			});

			it('should bind value', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [(ngModel)]="selectedCityId">
						<ng-option [value]="1">A</ng-option>
						<ng-option [value]="2">B</ng-option>
					</ng-select>`,
				);

				// from component to model
				await selectOption(fixture, KeyCode.ArrowDown, 0);
				fixture.detectChanges();
				await fixture.whenStable();
				expect(fixture.componentInstance.selectedCityId).toEqual(1);

				// from model to component
				fixture.componentInstance.selectedCityId = 2;
				fixture.detectChanges();
				await fixture.whenStable();

				expect(fixture.componentInstance.select().selectedItems).toEqual([
					jasmine.objectContaining({
						value: 2,
						label: 'B',
					}),
				]);
			});

			it('should not fail while resolving selected item from object', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [(ngModel)]="selectedCity">
                        <ng-option [value]="cities[0]">Vilnius</ng-option>
                        <ng-option [value]="cities[1]">Kaunas</ng-option>
                	</ng-select>`,
				);

				const selected = { name: 'Vilnius', id: 1 };
				fixture.componentInstance.selectedCity = selected;
				fixture.detectChanges();
				await fixture.whenStable();

				expect(fixture.componentInstance.select().selectedItems).toEqual([
					jasmine.objectContaining({
						value: selected,
						label: '',
					}),
				]);
			});
		});

		it('should not set internal model when single select ngModel is not valid', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [multiple]="false"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			const invalidValues = [undefined, null];

			for (const v of invalidValues) {
				fixture.componentInstance.selectedCity = <any>v;
				fixture.detectChanges();
				await fixture.whenStable();
				expect(fixture.componentInstance.select().selectedItems.length).toBe(0);
			}
		});

		it('should not set internal model when multiselect ngModel is not valid', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [multiple]="true"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			const invalidValues = [{}, '', undefined, 0, 1, 'false', 'true', false];

			for (const v of invalidValues) {
				fixture.componentInstance.selectedCity = <any>v;
				fixture.detectChanges();
				await fixture.whenStable();
				expect(fixture.componentInstance.select().selectedItems.length).toBe(0);
			}
		});

		describe('Pre-selected model', () => {
			describe('single', () => {
				it('should select by bindValue when primitive type', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            placeholder="select value"
                            [(ngModel)]="selectedCityId">
                        </ng-select>`,
					);

					fixture.componentInstance.selectedCityId = 2;
					fixture.detectChanges();
					await fixture.whenStable();
					const result = [
						jasmine.objectContaining({
							value: { id: 2, name: 'Kaunas' },
							selected: true,
						}),
					];
					select = fixture.componentInstance.select();
					expect(select.selectedItems).toEqual(result);
				});

				it('should apply host css classes', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            placeholder="select value"
                            [(ngModel)]="selectedCityId">
                        </ng-select>`,
					);

					fixture.componentInstance.selectedCityId = 2;
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.detectChanges();
					await fixture.whenStable();

					const classes = ['ng-select', 'ng-select-single', 'ng-select-searchable'];
					const selectEl = fixture.nativeElement.querySelector('ng-select');
					for (const c of classes) {
						expect(selectEl.classList.contains(c)).toBeTruthy(`expected to contain "${c}" class`);
					}
					let hasValueEl = fixture.nativeElement.querySelector('.ng-has-value');
					expect(hasValueEl).not.toBeNull();

					fixture.componentInstance.selectedCityId = null;
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.detectChanges();
					await fixture.whenStable();
					hasValueEl = fixture.nativeElement.querySelector('.ng-has-value');
					expect(hasValueEl).toBeNull();
				});

				it('should select by bindValue ', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            placeholder="select value"
                            [(ngModel)]="selectedCityId">
                        </ng-select>`,
					);

					fixture.componentInstance.cities = [{ id: 0, name: 'Vilnius' }];
					fixture.componentInstance.selectedCityId = 0;

					fixture.detectChanges();
					await fixture.whenStable();

					const result = [
						jasmine.objectContaining({
							value: { id: 0, name: 'Vilnius' },
							selected: true,
						}),
					];
					expect(fixture.componentInstance.select().selectedItems).toEqual(result);
				});

				it('should select by bindLabel when binding to object', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            placeholder="select value"
                            [(ngModel)]="selectedCity">
                        </ng-select>`,
					);

					fixture.componentInstance.selectedCity = { id: 2, name: 'Kaunas' };
					fixture.detectChanges();
					await fixture.whenStable();
					const result = [
						jasmine.objectContaining({
							value: { id: 2, name: 'Kaunas' },
							selected: true,
						}),
					];
					expect(fixture.componentInstance.select().selectedItems).toEqual(result);
				});

				it('should select by object reference', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            placeholder="select value"
                            [(ngModel)]="selectedCity">
                        </ng-select>`,
					);

					fixture.componentInstance.selectedCity = fixture.componentInstance.cities[1];
					fixture.detectChanges();
					await fixture.whenStable();
					const result = [
						jasmine.objectContaining({
							value: { id: 2, name: 'Kaunas' },
							selected: true,
						}),
					];
					expect(fixture.componentInstance.select().selectedItems).toEqual(result);
				});

				it('should select by compareWith function when bindValue is not used', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            placeholder="select value"
                            [compareWith]="compareWith"
                            [(ngModel)]="selectedCity">
                        </ng-select>`,
					);

					const city = { name: 'Vilnius', id: 7, district: 'Ozo parkas' };
					fixture.componentInstance.cities.push(city);
					fixture.componentInstance.cities = [...fixture.componentInstance.cities];
					fixture.componentInstance.selectedCity = { name: 'Vilnius', district: 'Ozo parkas' } as any;

					fixture.detectChanges();
					await fixture.whenStable();
					expect(fixture.componentInstance.select().selectedItems[0].value).toEqual(city);
				});

				it('should select by compareWith function when bindValue is used', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            placeholder="select value"
                            [compareWith]="compareWith"
                            [(ngModel)]="selectedCityId">
                        </ng-select>`,
					);

					const cmp = fixture.componentInstance;
					cmp.selectedCityId = cmp.cities[1].id.toString();

					cmp.compareWith = (city, model: string) => city.id === +model;

					fixture.detectChanges();
					await fixture.whenStable();
					expect(cmp.select().selectedItems[0].value).toEqual(cmp.cities[1]);
				});

				it('should call compareWith when items are updated from empty to populated', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="itemsWithNestedBindValue"
                            bindLabel="description"
                            bindValue="item"
                            [compareWith]="compareWith"
                            [(ngModel)]="nestedSelectedItem">
                        </ng-select>`,
					);

					const cmp = fixture.componentInstance;
					const select = fixture.componentInstance.select();
					// Start with empty items and a selected item
					cmp.itemsWithNestedBindValue = [];
					cmp.nestedSelectedItem = { code: 'A', value: 'description' };
					cmp.compareWith = vi.fn().mockImplementation((toCompare, selected) => {
						return toCompare && selected && toCompare.item && toCompare.item.code === selected.code;
					});

					fixture.detectChanges();
					await fixture.whenStable();

					// Initially no compareWith should be called since items is empty
					expect(cmp.compareWith).not.toHaveBeenCalled();
					expect(select.hasValue).toBe(true);
					expect(select.selectedItems.length).toBe(1);

					// Now update items to contain the matching item
					cmp.itemsWithNestedBindValue = [
						{
							description: 'alternate description',
							item: { code: 'A', value: 'description' },
							group: 'some group'
						}
					];

					fixture.detectChanges();
					await fixture.whenStable();

					// compareWith should be called when items are updated
					expect(cmp.compareWith).toHaveBeenCalled();

					// The selected item should be properly mapped to the new item
					expect(select.selectedItems.length).toBe(1);
					expect(select.selectedItems[0].value).toEqual({
						description: 'alternate description',
						item: { code: 'A', value: 'description' },
						group: 'some group'
					});
				});

				it('should select selected when there is no items', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            placeholder="select value"
                            [(ngModel)]="selectedCityId">
                        </ng-select>`,
					);

					fixture.componentInstance.cities = [];
					fixture.componentInstance.selectedCityId = 2;
					fixture.detectChanges();
					await fixture.whenStable();
					const selected = fixture.componentInstance.select().selectedItems[0];
					expect(selected.label).toEqual('');
					expect(selected.value).toEqual({ name: null, id: 2 });
				});
			});

			describe('multiple', () => {
				const result = [
					jasmine.objectContaining({
						value: { id: 2, name: 'Kaunas' },
						selected: true,
					}),
					jasmine.objectContaining({
						value: { id: 3, name: 'Pabrade' },
						selected: true,
					}),
				];

				it('should select by bindValue when primitive type', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            multiple="true"
                            placeholder="select value"
                            [(ngModel)]="selectedCityIds">
                        </ng-select>`,
					);

					fixture.componentInstance.selectedCityIds = [2, 3];
					fixture.detectChanges();
					await fixture.whenStable();

					expect(fixture.componentInstance.select().selectedItems).toEqual(result);
				});

				it('should select by bindLabel when binding to object', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            multiple="true"
                            placeholder="select value"
                            [(ngModel)]="selectedCities">
                        </ng-select>`,
					);

					fixture.componentInstance.selectedCities = [
						{ id: 2, name: 'Kaunas' },
						{ id: 3, name: 'Pabrade' },
					];
					fixture.detectChanges();
					await fixture.whenStable();
					expect(fixture.componentInstance.select().selectedItems).toEqual(result);
				});
			});
		});
	});

	describe('Dropdown panel', () => {
		it('should set and render items in dropdown panel', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                            bindLabel="name"
                            [(ngModel)]="city">
                </ng-select>`,
			);

			const select = fixture.componentInstance.select();
			select.open();

			expect(select.dropdownPanel().items().length).toBe(3);
			let options = fixture.debugElement.nativeElement.querySelectorAll('.ng-option');
			expect(options.length).toBe(3);
			expect(options[0].innerText).toBe('Vilnius');
			expect(options[1].innerText).toBe('Kaunas');
			expect(options[2].innerText).toBe('Pabrade');

			fixture.componentInstance.cities = Array.from(Array(30).keys()).map((_, i) => ({
				id: i,
				name: String.fromCharCode(97 + i),
			}));
			fixture.detectChanges();
			await fixture.whenStable();
			options = fixture.debugElement.nativeElement.querySelectorAll('.ng-option');
			expect(options.length).toBe(30);
			expect(options[0].innerText).toBe('a');
		});

		it('should always have div #padding with height 0 in dropdown panel when virtual scroll is disabled', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                            bindLabel="name"
                            [virtualScroll]="false">
                </ng-select>`,
			);

			const select = fixture.componentInstance.select();
			select.open();

			const panelItems = document.querySelector('.ng-dropdown-panel-items');
			const firstChild = <HTMLScriptElement>panelItems.firstChild;

			expect(firstChild.offsetHeight).toBe(0);
		});

		it('should have div #padding with height other than 0 in dropdown panel when virtual scroll is enabled', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                            bindLabel="name"
                            [virtualScroll]="true">
                </ng-select>`,
			);

			const select = fixture.componentInstance.select();
			select.open();

			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();

			expect(fixture.componentInstance.select().dropdownPanel().items().length).toBe(3);
			const options = fixture.debugElement.nativeElement.querySelectorAll('.ng-option');
			expect(options.length).toBe(3);
			expect(options[0].innerText).toBe('Vilnius');
			expect(options[1].innerText).toBe('Kaunas');
			expect(options[2].innerText).toBe('Pabrade');

			fixture.componentInstance.cities = Array.from(Array(30).keys()).map((_, i) => ({
				id: i,
				name: String.fromCharCode(97 + i),
			}));
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();

			const panelItems = document.querySelector('.ng-dropdown-panel-items');
			const firstChild = <HTMLScriptElement>panelItems.firstChild;

			expect(firstChild.offsetHeight).not.toBe(0);
		});

		it('should set and render items in dropdown panel with virtual scroll', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                            bindLabel="name"
                            [virtualScroll]="true"
                            [(ngModel)]="city">
                </ng-select>`,
			);

			const select = fixture.componentInstance.select();
			select.open();

			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();

			expect(fixture.componentInstance.select().dropdownPanel().items().length).toBe(3);
			let options = fixture.debugElement.nativeElement.querySelectorAll('.ng-option');
			expect(options.length).toBe(3);
			expect(options[0].innerText).toBe('Vilnius');
			expect(options[1].innerText).toBe('Kaunas');
			expect(options[2].innerText).toBe('Pabrade');

			fixture.componentInstance.cities = Array.from(Array(30).keys()).map((_, i) => ({
				id: i,
				name: String.fromCharCode(97 + i),
			}));
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();
			options = fixture.debugElement.nativeElement.querySelectorAll('.ng-option');
			expect(options.length).toBe(8);
			expect(options[0].innerText).toBe('a');
		});

		it('should open empty dropdown panel with virtual scroll', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="[]"
                            bindLabel="name"
                            [virtualScroll]="true"
                            appendTo="body"
                            [(ngModel)]="city">
                </ng-select>`,
			);

			const select = fixture.componentInstance.select();
			select.open();
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();

			const options = document.querySelectorAll('.ng-option');
			expect(options.length).toBe(1);
			expect((<HTMLElement>options[0]).innerText).toBe('No items found');
		});

		it('should scroll to selected item on first open when virtual scroll is enabled', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                            bindLabel="name"
                            [virtualScroll]="true"
                            [appendTo]="body"
                            [(ngModel)]="city">
                </ng-select>`,
			);

			const select = fixture.componentInstance.select();
			const cmp = fixture.componentInstance;
			cmp.cities = Array.from(Array(30).keys()).map((_, i) => ({ id: i, name: String.fromCharCode(97 + i) }));
			cmp.city = cmp.cities[10];
			fixture.detectChanges();
			await fixture.whenStable();

			select.open();
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();

			const options = fixture.debugElement.nativeElement.querySelectorAll('.ng-option');
			const marked = fixture.debugElement.nativeElement.querySelector('.ng-option-marked');

			// Accept both 17 and 18 options as valid (environment-dependent panel height causes this variation)
			// With 240px panel height: itemsPerViewport=12, buffer=4, renders 18 options
			// With 220px panel height: itemsPerViewport=11, buffer=4, renders 17 options
			expect(options.length).toBeGreaterThanOrEqual(17);
			expect(options.length).toBeLessThanOrEqual(18);
			expect(marked.innerText).toBe('k');
			expect(marked.offsetTop).toBeGreaterThanOrEqual(180);
		});

		it('should scroll to item and do not change scroll position when scrolled to visible item', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                            bindLabel="name"
                            [(ngModel)]="city">
                </ng-select>`,
			);
			const cmp = fixture.componentInstance;
			const el: HTMLElement = fixture.debugElement.nativeElement;

			cmp.select().open();
			fixture.detectChanges();
			await fixture.whenStable();

			cmp.cities = Array.from(Array(30).keys()).map((_, i) => ({ id: i, name: String.fromCharCode(97 + i) }));
			fixture.detectChanges();
			await fixture.whenStable();

			cmp.select().dropdownPanel().scrollTo(cmp.select().itemsList.items[1]);
			fixture.detectChanges();
			await fixture.whenStable();

			const panelItems = el.querySelector('.ng-dropdown-panel-items');
			expect(panelItems.scrollTop).toBe(0);
		});

		it('should scroll to item and change scroll position when scrolled to not visible item', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
								bindLabel="name"
								[(ngModel)]="city">
					</ng-select>`,
			);
			const cmp = fixture.componentInstance;
			const el: HTMLElement = fixture.debugElement.nativeElement;

			cmp.cities = Array.from(Array(30).keys()).map((_, i) => ({ id: i, name: String.fromCharCode(97 + i) }));
			cmp.select().open();
			fixture.detectChanges();
			await fixture.whenStable();

			cmp.select().dropdownPanel().scrollTo(cmp.select().itemsList.items[15]);
			fixture.detectChanges();
			await fixture.whenStable();

			const panelItems = el.querySelector('.ng-dropdown-panel-items');
			expect(panelItems.scrollTop).toBeGreaterThanOrEqual(48);
		});

		it('should close on option select by default', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
									bindLabel="name"
									[(ngModel)]="city">
						</ng-select>`,
			);

			await selectOption(fixture, KeyCode.ArrowDown, 0);
			fixture.detectChanges();

			await fixture.whenStable();
			expect(fixture.componentInstance.select().isOpen()).toBeFalsy();
		});
	});

	it('should select item with encapsulation = ShadowDom', async () => {
		const fixture = createTestingModule(
			EncapsulatedTestComponent,
			`<ng-select [items]="cities"
									bindLabel="name"
									[(ngModel)]="city"></ng-select>`,
		);

		expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(0);
		expect(fixture.componentInstance.select().isOpen()).toBeFalsy();

		const cmp = fixture.componentInstance;

		cmp.select().open();
		fixture.detectChanges();
		await fixture.whenStable();

		expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(0);
		expect(fixture.componentInstance.select().isOpen()).toBeTruthy();

		const outsideClick = vi.spyOn(cmp.select().dropdownPanel().outsideClick, 'emit');
		expect(outsideClick).not.toHaveBeenCalled();

		const listItem = fixture.debugElement.query(By.css('.ng-option'));
		let event = new MouseEvent('mousedown', { bubbles: true });
		listItem.nativeElement.dispatchEvent(event);
		event = new MouseEvent('click', { bubbles: true });
		listItem.nativeElement.dispatchEvent(event);
		fixture.detectChanges();
		await fixture.whenStable();

		await fixture.whenStable();
		expect(outsideClick).not.toHaveBeenCalled();
		expect(fixture.componentInstance.select().isOpen()).toBeFalsy();
		expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(1);
	});
});

it('should not close when isOpen is true', async () => {
	const fixture = createTestingModule(
		NgSelectTestComponent,
		`<ng-select [items]="cities"
									[isOpen]="true"
									bindLabel="name"
									[(ngModel)]="city">
						</ng-select>`,
	);

	await selectOption(fixture, KeyCode.ArrowDown, 0);
	fixture.detectChanges();

	await fixture.whenStable();
	expect(fixture.componentInstance.select().isOpen()).toBeTruthy();
});

it('should not close on option select when [closeOnSelect]="false"', async () => {
	const fixture = createTestingModule(
		NgSelectTestComponent,
		`<ng-select [items]="cities"
									bindLabel="name"
									[closeOnSelect]="false"
									[(ngModel)]="city">
						</ng-select>`,
	);

	await selectOption(fixture, KeyCode.ArrowDown, 0);
	fixture.detectChanges();
	await fixture.whenStable();

	expect(fixture.componentInstance.select().isOpen()).toBeTruthy();
});

it('should remove appended dropdown when it is destroyed', async () => {
	const fixture = createTestingModule(
		NgSelectTestComponent,
		`
						<ng-select [items]="cities"
								appendTo="body"
								[(ngModel)]="city">
						</ng-select>`,
	);

	fixture.componentInstance.select().open();
	fixture.detectChanges();
	fixture.componentInstance.select().close();
	fixture.detectChanges();

	await fixture.whenStable();
	const dropdown = <HTMLElement>document.querySelector('.ng-dropdown-panel');
	expect(dropdown).toBeNull();
});

it('should set aria-label on the inner listbox element when ariaLabelDropdown input is provided', async () => {
	const fixture = createTestingModule(
		NgSelectTestComponent,
		`<ng-select [items]="cities" ariaLabelDropdown="Custom Aria Label" />`,
	);

	const select = fixture.componentInstance.select();
	select.open();
	fixture.detectChanges();
	await fixture.whenStable();

	// The dropdown panel itself should NOT have aria-label directly
	const dropdownPanel = fixture.debugElement.nativeElement.querySelector('.ng-dropdown-panel');
	expect(dropdownPanel.getAttribute('aria-label')).toBeNull();

	// The inner element with role="listbox" should have the aria-label
	const listboxElement = fixture.debugElement.nativeElement.querySelector('.ng-dropdown-panel-items[role="listbox"]');
	expect(listboxElement.getAttribute('aria-label')).toBe('Custom Aria Label');
});

describe('Keyboard events', () => {
	let fixture: ComponentFixture<NgSelectTestComponent>;
	let select: NgSelectComponent;

	beforeEach(() => {
		fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
						bindLabel="name"
						[loading]="citiesLoading"
						[selectOnTab]="selectOnTab"
						[openOnEnter]="openOnEnter"
						[multiple]="multiple"
						[clearOnBackspace]="clearOnBackspace"
						[clearable]="clearable"
						[markFirst]="markFirst"
						[searchable]="searchable"
						[(ngModel)]="selectedCity">
					</ng-select>`,
		);
		select = fixture.componentInstance.select();
	});

	describe('space', () => {
		it('should open dropdown', () => {
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
			expect(select.isOpen()).toBe(true);
		});

		it('should not open dropdown when isOpen is false', () => {
			const open = vi.spyOn(select, 'open');
			select.ngOnChanges(<any>{ isOpen: { currentValue: false } });
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
			expect(select.isOpen()).toBeFalsy();
			expect(open).not.toHaveBeenCalled();
		});

		it('should open empty dropdown if no items', async () => {
			fixture.componentInstance.cities = [];
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
			fixture.detectChanges();
			await fixture.whenStable();
			const text = fixture.debugElement.query(By.css('.ng-option')).nativeElement.innerHTML;
			expect(text).toContain('No items found');
		});

		it('should open dropdown with loading message', async () => {
			fixture.componentInstance.cities = [];
			fixture.componentInstance.citiesLoading = true;
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
			fixture.detectChanges();
			await fixture.whenStable();
			const options = fixture.debugElement.queryAll(By.css('.ng-option'));
			expect(options.length).toBe(1);
			expect(options[0].nativeElement.innerHTML).toContain('Loading...');
		});

		it('should open dropdown and mark first item', () => {
			const result = { value: fixture.componentInstance.cities[0] };
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
			expect(select.itemsList.markedItem).toEqual(jasmine.objectContaining(result));
		});

		it('should open dropdown and mark first not disabled item', async () => {
			fixture.componentInstance.cities[0].disabled = true;
			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();
			const result = { value: fixture.componentInstance.cities[1] };
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
			expect(select.itemsList.markedItem).toEqual(jasmine.objectContaining(result));
		});

		it('should open dropdown without marking first item', async () => {
			fixture.componentInstance.markFirst = false;
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
			expect(select.itemsList.markedItem).toEqual(undefined);
		});
	});

	describe('arrows', () => {
		it('should select next value on arrow down', async () => {
			await selectOption(fixture, KeyCode.ArrowDown, 1);
			const result = [
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[1],
				}),
			];
			expect(select.selectedItems).toEqual(result);
		});

		it('should stop marked loop if all items disabled', async () => {
			fixture.componentInstance.cities[0].disabled = true;
			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();
			select.filter('vil');
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.ArrowDown);
			expect(select.itemsList.markedItem).toBeUndefined();
		});

		it('should select first value on arrow down when current value is last', async () => {
			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[2];
			fixture.detectChanges();
			await fixture.whenStable();
			await selectOption(fixture, KeyCode.ArrowDown, 1);
			fixture.detectChanges();
			await fixture.whenStable();
			const result = [
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[0],
				}),
			];
			expect(select.selectedItems).toEqual(result);
		});

		it('should skip disabled option and select next one', async () => {
			const city: any = fixture.componentInstance.cities[0];
			city.disabled = true;
			await selectOption(fixture, KeyCode.ArrowDown, 1);
			fixture.detectChanges();
			await fixture.whenStable();
			const result = [
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[1],
				}),
			];
			expect(select.selectedItems).toEqual(result);
		});

		it('should select previous value on arrow up', async () => {
			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[1];
			fixture.detectChanges();
			await fixture.whenStable();
			await selectOption(fixture, KeyCode.ArrowUp, 1);
			fixture.detectChanges();
			await fixture.whenStable();
			const result = [
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[0],
				}),
			];
			expect(select.selectedItems).toEqual(result);
		});

		it('should select last value on arrow up', async () => {
			await selectOption(fixture, KeyCode.ArrowUp, 1);
			const result = [
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[2],
				}),
			];
			expect(select.selectedItems).toEqual(result);
		});
	});

	describe('esc', () => {
		it('should close opened dropdown', () => {
			select.isOpen.set(true);
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Esc);
			expect(select.isOpen()).toBe(false);
		});
	});

	describe('backspace', () => {
		it('should remove selected value', async () => {
			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Backspace);
			expect(select.selectedItems).toEqual([]);
		});

		it('should not remove selected value if filter is set', async () => {
			select.filter('a');

			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Backspace);
			const result = [
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[0],
				}),
			];
			expect(select.selectedItems).toEqual(result);
		});

		it('should not remove selected value when clearable is false', async () => {
			fixture.componentInstance.clearable = false;
			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Backspace);
			const result = [
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[0],
				}),
			];
			expect(select.selectedItems).toEqual(result);
		});

		it('should do nothing when there is no selection', async () => {
			const clear = vi.spyOn(select, 'clearModel');
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Backspace);
			expect(clear).not.toHaveBeenCalled();
		});

		it('should remove last selected value when multiple', async () => {
			const remove = vi.spyOn(select.removeEvent, 'emit');
			const removedItem = fixture.componentInstance.cities[2];
			fixture.componentInstance.multiple = true;
			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();
			await selectOption(fixture, KeyCode.ArrowDown, 1);
			await selectOption(fixture, KeyCode.ArrowDown, 1);
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Backspace);
			const result = [
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[1],
				}),
			];
			expect(select.selectedItems).toEqual(result);
			expect(remove).toHaveBeenCalledWith(removedItem);
		});

		it('should not remove last selected if it is disabled', async () => {
			const remove = vi.spyOn(select.removeEvent, 'emit');
			fixture.componentInstance.multiple = true;
			const disabled = { ...fixture.componentInstance.cities[1], disabled: true };
			fixture.componentInstance.selectedCity = <any>[fixture.componentInstance.cities[0], disabled];
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.cities[1].disabled = true;
			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Backspace);
			const result = [
				jasmine.objectContaining({
					value: fixture.componentInstance.cities[1],
				}),
			];
			expect(select.selectedItems).toEqual(result);
			expect(remove).toHaveBeenCalled();
		});

		it('should not remove selected value when clearOnBackspace false', async () => {
			fixture.componentInstance.multiple = true;
			fixture.componentInstance.clearOnBackspace = false;
			fixture.componentInstance.cities = [...fixture.componentInstance.cities];
			fixture.detectChanges();
			await fixture.whenStable();
			await selectOption(fixture, KeyCode.ArrowDown, 1);
			await selectOption(fixture, KeyCode.ArrowDown, 1);
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Backspace);
			expect(select.selectedItems.length).toEqual(2);
		});
	});

	describe('key presses', () => {
		beforeEach(async () => {
			fixture.componentInstance.searchable = false;
			fixture.detectChanges();
			await fixture.whenStable();
			select.ngOnInit();
		});

		it('should select item using key while not opened', async () => {
			triggerKeyDownEvent(getNgSelectElement(fixture), 'v');
			await new Promise(resolve => setTimeout(resolve, 200));

			expect(fixture.componentInstance.selectedCity.name).toBe('Vilnius');
		});

		it('should mark item using key while opened', async () => {
			const findByLabel = vi.spyOn(select.itemsList, 'findByLabel');
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
			triggerKeyDownEvent(getNgSelectElement(fixture), 'v');
			triggerKeyDownEvent(getNgSelectElement(fixture), 'i');
			triggerKeyDownEvent(getNgSelectElement(fixture), 'l');
			fixture.detectChanges();
			await fixture.whenStable();
			await new Promise(resolve => setTimeout(resolve, 200));

			expect(fixture.componentInstance.selectedCity).toBeUndefined();
			expect(select.itemsList.markedItem.label).toBe('Vilnius');
			expect(findByLabel).toHaveBeenCalledWith('vil');
		});
	});

	describe('enter', () => {
		beforeEach(async () => {
			fixture.componentInstance.searchable = false;
			fixture.detectChanges();
			await fixture.whenStable();
			select.ngOnInit();
		});

		it('should open dropdown when it is closed', async () => {
			fixture.componentInstance.openOnEnter = true;
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
			fixture.detectChanges();
			await fixture.whenStable();
			expect(select.isOpen()).toBe(true);
		});

		it('should select option and close dropdown', () => {
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
			expect(select.selectedItems[0].value).toEqual(fixture.componentInstance.cities[0]);
			expect(select.isOpen()).toBe(false);
		});

		it('should not open dropdown if [openOnEnter]="false"', async () => {
			fixture.componentInstance.openOnEnter = false;
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
			expect(select.isOpen()).toBe(false);
		});

		it('should clear input when enter pressed while clear button focused', async () => {
			await selectOption(fixture, KeyCode.ArrowDown, 0);
			select.searchInput().nativeElement.focus();
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);

			const handleClearClick = vi.spyOn(select, 'handleClearClick');
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter, select.clearButton().nativeElement);
			expect(handleClearClick).toHaveBeenCalled();
		});
	});
});

describe('Keyboard events (tab)', () => {
	function genericFixture() {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
						bindLabel="name"
						[loading]="citiesLoading"
						[selectOnTab]="selectOnTab"
						[multiple]="multiple"
						[tabFocusOnClearButton]="tabFocusOnClearButton"
						[(ngModel)]="selectedCity" />
					`,
		);
		const select = fixture.componentInstance.select();
		return { fixture, select };
	}

	it('should close dropdown when there are no items', async () => {
		const { fixture, select } = genericFixture();
		select.filter('random stuff');
		await new Promise(resolve => setTimeout(resolve, 200));
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
		expect(select.isOpen()).toBeFalsy();
	});

	it('should close dropdown when [selectOnTab]="false"', async () => {
		const { fixture, select } = genericFixture();
		fixture.componentInstance.selectOnTab = false;
		fixture.detectChanges();
		await fixture.whenStable();
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
		expect(select.selectedItems).toEqual([]);
		expect(select.isOpen()).toBeFalsy();
	});

	it('should close dropdown and keep selected value', async () => {
		const { fixture, select } = genericFixture();
		fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
		fixture.detectChanges();
		await fixture.whenStable();
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
		fixture.detectChanges();
		await fixture.whenStable();
		const result = [
			jasmine.objectContaining({
				value: fixture.componentInstance.cities[0],
			}),
		];
		expect(select.selectedItems).toEqual(result);
		expect(select.isOpen()).toBeFalsy();
	});

	it('should mark first item on filter when tab', async () => {
		const { fixture } = genericFixture();
		await new Promise(resolve => setTimeout(resolve, 200));
		fixture.componentInstance.select().filter('pab');
		await new Promise(resolve => setTimeout(resolve, 200));

		const result = jasmine.objectContaining({
			value: fixture.componentInstance.cities[2],
		});
		expect(fixture.componentInstance.select().itemsList.markedItem).toEqual(result);
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
		expect(fixture.componentInstance.select().selectedItems).toEqual([result]);
	});

	it('should focus on clear button when tab pressed while not opened and clear showing', async () => {
		const { fixture, select } = genericFixture();
		fixture.componentInstance.tabFocusOnClearButton = true;
		await selectOption(fixture, KeyCode.ArrowDown, 0);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(select.showClear()).toBeTruthy();

		select.searchInput().nativeElement.focus();
		const focusOnClear = vi.spyOn(select, 'focusOnClear');
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
		expect(focusOnClear).toHaveBeenCalled();
	});

	it('should not focus on clear button when tab pressed if global flag is false and [tabFocusOnClearButton]="false"', async () => {
		const config = new NgSelectConfig();
		config.tabFocusOnClear = false;
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
							bindLabel="name"
							[loading]="citiesLoading"
							[selectOnTab]="selectOnTab"
							[multiple]="multiple"
													[tabFocusOnClearButton]="tabFocusOnClearButton"
							[(ngModel)]="selectedCity">
					</ng-select>`,
			config,
		);
		const select = fixture.componentInstance.select();
		fixture.componentInstance.tabFocusOnClearButton = false;
		await selectOption(fixture, KeyCode.ArrowDown, 0);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(select.showClear()).toBeTruthy();

		select.searchInput().nativeElement.focus();
		const focusOnClear = vi.spyOn(select, 'focusOnClear');
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
		expect(focusOnClear).not.toHaveBeenCalled();
	});

	it('should not focus on clear button when tab pressed if global flag is true and [tabFocusOnClearButton]="false"', async () => {
		const config = new NgSelectConfig();
		config.tabFocusOnClear = true;
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
							bindLabel="name"
							[loading]="citiesLoading"
							[selectOnTab]="selectOnTab"
							[multiple]="multiple"
													[tabFocusOnClearButton]="tabFocusOnClearButton"
							[(ngModel)]="selectedCity">
					</ng-select>`,
			config,
		);
		const select = fixture.componentInstance.select();
		fixture.componentInstance.tabFocusOnClearButton = false;
		await selectOption(fixture, KeyCode.ArrowDown, 0);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(select.showClear()).toBeTruthy();

		select.searchInput().nativeElement.focus();
		const focusOnClear = vi.spyOn(select, 'focusOnClear');
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
		expect(focusOnClear).not.toHaveBeenCalled();
	});

	it('should focus on clear button when tab pressed if global flag is false and [tabFocusOnClearButton]="true"', async () => {
		const config = new NgSelectConfig();
		config.tabFocusOnClear = false;
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
							bindLabel="name"
							[loading]="citiesLoading"
							[selectOnTab]="selectOnTab"
							[multiple]="multiple"
							[tabFocusOnClearButton]="tabFocusOnClearButton"
							[(ngModel)]="selectedCity">
					</ng-select>`,
			config,
		);
		const select = fixture.componentInstance.select();
		fixture.componentInstance.tabFocusOnClearButton = true;
		await selectOption(fixture, KeyCode.ArrowDown, 0);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(select.showClear()).toBeTruthy();

		select.searchInput().nativeElement.focus();
		const focusOnClear = vi.spyOn(select, 'focusOnClear');
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
		expect(focusOnClear).toHaveBeenCalled();
	});

	it('should focus on clear button when tab pressed if global flag is true and [tabFocusOnClearButton]="true"', async () => {
		const config = new NgSelectConfig();
		config.tabFocusOnClear = true;
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
							bindLabel="name"
							[loading]="citiesLoading"
							[selectOnTab]="selectOnTab"
							[multiple]="multiple"
													[tabFocusOnClearButton]="tabFocusOnClearButton"
							[(ngModel)]="selectedCity">
					</ng-select>`,
			config,
		);
		const select = fixture.componentInstance.select();
		fixture.componentInstance.tabFocusOnClearButton = true;
		await selectOption(fixture, KeyCode.ArrowDown, 0);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(select.showClear()).toBeTruthy();

		select.searchInput().nativeElement.focus();
		const focusOnClear = vi.spyOn(select, 'focusOnClear');
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
		expect(focusOnClear).toHaveBeenCalled();
	});

	it('should not focus on clear button when tab pressed if global flag is false and [tabFocusOnClearButton] is not provided', async () => {
		const config = new NgSelectConfig();
		config.tabFocusOnClear = false;
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
							bindLabel="name"
							[loading]="citiesLoading"
							[selectOnTab]="selectOnTab"
							[multiple]="multiple"
							[(ngModel)]="selectedCity">
					</ng-select>`,
			config,
		);
		const select = fixture.componentInstance.select();
		await selectOption(fixture, KeyCode.ArrowDown, 0);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(select.showClear()).toBeTruthy();

		select.searchInput().nativeElement.focus();
		const focusOnClear = vi.spyOn(select, 'focusOnClear');
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
		expect(focusOnClear).not.toHaveBeenCalled();
	});

	it('should focus on clear button when tab pressed if global flag is true and [tabFocusOnClearButton] is not provided', async () => {
		const config = new NgSelectConfig();
		config.tabFocusOnClear = true;
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
							bindLabel="name"
							[loading]="citiesLoading"
							[selectOnTab]="selectOnTab"
							[multiple]="multiple"
							[(ngModel)]="selectedCity">
					</ng-select>`,
			config,
		);
		const select = fixture.componentInstance.select();
		await selectOption(fixture, KeyCode.ArrowDown, 0);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(select.showClear()).toBeTruthy();

		select.searchInput().nativeElement.focus();
		const focusOnClear = vi.spyOn(select, 'focusOnClear');
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
		expect(focusOnClear).toHaveBeenCalled();
	});
});

describe('Outside click', () => {
	let fixture: ComponentFixture<NgSelectTestComponent>;
	let select: NgSelectComponent;
	beforeEach(() => {
		fixture = createTestingModule(
			NgSelectTestComponent,
			`<div id="outside">Outside</div><br />
					<ng-select id="select" [items]="cities"
						bindLabel="name"
						multiple="true"
						[closeOnSelect]="false"
						appendTo="body"
						[(ngModel)]="selectedCity">
					</ng-select>`,
		);
		select = fixture.componentInstance.select();
	});

	it('should close dropdown if opened and clicked outside dropdown container', async () => {
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
		expect(fixture.componentInstance.select().isOpen()).toBeTruthy();
		document.getElementById('outside').click();
		const event = new MouseEvent('mousedown', { bubbles: true });
		document.getElementById('outside').dispatchEvent(event);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.componentInstance.select().isOpen()).toBeFalsy();
	});

	it('should prevent dropdown close if clicked on select', async () => {
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
		expect(select.isOpen()).toBeTruthy();
		document.getElementById('select').click();
		const event = new MouseEvent('mousedown', { bubbles: true });
		document.getElementById('select').dispatchEvent(event);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(select.isOpen()).toBeTruthy();
	});
});

describe('Dropdown position', () => {
	it('should auto position dropdown to bottom by default', async () => {
		const fixture = createTestingModule(NgSelectTestComponent, `<ng-select [items]="cities"></ng-select>`);

		const select = fixture.componentInstance.select();
		select.open();
		fixture.detectChanges();
		await fixture.whenStable();

		const selectClasses = (<HTMLElement>fixture.nativeElement).querySelector('.ng-select').classList;
		const panelClasses = (<HTMLElement>fixture.nativeElement).querySelector('.ng-dropdown-panel').classList;
		expect(select.dropdownPosition()).toBe('auto');
		expect(selectClasses.contains('ng-select-bottom')).toBeTruthy();
		expect(panelClasses.contains('ng-select-bottom')).toBeTruthy();
		expect(selectClasses.contains('ng-select-top')).toBeFalsy();
		expect(panelClasses.contains('ng-select-top')).toBeFalsy();
	});

	it('should auto position dropdown to top if position input is set', async () => {
		const fixture = createTestingModule(NgSelectTestComponent, `<ng-select dropdownPosition="top" [items]="cities"></ng-select>`);

		const select = fixture.componentInstance.select();
		select.open();
		fixture.detectChanges();
		await fixture.whenStable();

		const selectClasses = (<HTMLElement>fixture.nativeElement).querySelector('.ng-select').classList;
		const panelClasses = (<HTMLElement>fixture.nativeElement).querySelector('.ng-dropdown-panel').classList;
		expect(select.dropdownPosition()).toBe('top');
		expect(selectClasses.contains('ng-select-bottom')).toBeFalsy();
		expect(panelClasses.contains('ng-select-bottom')).toBeFalsy();
		expect(selectClasses.contains('ng-select-top')).toBeTruthy();
		expect(panelClasses.contains('ng-select-top')).toBeTruthy();
	});

	it('should auto position appended to body dropdown to bottom', async () => {
		const fixture = createTestingModule(NgSelectTestComponent, `<ng-select [items]="cities" appendTo="body"></ng-select>`);

		const select = fixture.componentInstance.select();
		select.open();
		fixture.detectChanges();
		await fixture.whenStable();

		const selectClasses = (<HTMLElement>fixture.nativeElement).querySelector('.ng-select').classList;
		const panelClasses = document.querySelector('.ng-dropdown-panel').classList;
		expect(select.dropdownPosition()).toBe('auto');
		expect(selectClasses.contains('ng-select-bottom')).toBeTruthy();
		expect(panelClasses.contains('ng-select-bottom')).toBeTruthy();
		expect(selectClasses.contains('ng-select-top')).toBeFalsy();
		expect(panelClasses.contains('ng-select-top')).toBeFalsy();
	});

	it('should return current panel position', async () => {
		const fixture = createTestingModule(NgSelectTestComponent, `<ng-select [items]="cities" appendTo="body"></ng-select>`);

		const select = fixture.componentInstance.select();
		select.open();
		fixture.detectChanges();
		await fixture.whenStable();

		expect(select.currentPanelPosition).toBe('bottom');
	});

	it('should return undefined for current panel position if dropdown is closed', async () => {
		const fixture = createTestingModule(NgSelectTestComponent, `<ng-select [items]="cities" appendTo="body"></ng-select>`);

		const select = fixture.componentInstance.select();
		select.open();
		fixture.detectChanges();
		await fixture.whenStable();
		select.close();
		fixture.detectChanges();
		await fixture.whenStable();

		expect(select.currentPanelPosition).toBeUndefined();
	});
});

describe('Custom templates', () => {
	it('should display custom header template', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities" [(ngModel)]="selectedCity">
						<ng-template ng-label-tmp let-item="item">
							<div class="custom-header">{{item.name}}</div>
						</ng-template>
					</ng-select>`,
		);

		fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		await fixture.whenStable();

		const el = fixture.debugElement.query(By.css('.custom-header'));
		expect(el).not.toBeNull();
		expect(el.nativeElement).not.toBeNull();
	});

	it('should clear item using value', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
								bindLabel="name"
								[(ngModel)]="city">
					</ng-select>`,
		);

		await selectOption(fixture, KeyCode.ArrowDown, 0);
		fixture.detectChanges();
		expect(fixture.componentInstance.select().selectedItems.length).toBe(1);

		fixture.componentInstance.select().clearItem(fixture.componentInstance.cities[0]);
		expect(fixture.componentInstance.select().selectedItems.length).toBe(0);
		await new Promise(resolve => setTimeout(resolve, 0));
	});

	it('should clear item even if there are no items loaded', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
								bindLabel="name"
								[(ngModel)]="selectedCity">
					</ng-select>`,
		);

		await selectOption(fixture, KeyCode.ArrowDown, 0);
		fixture.detectChanges();
		expect(fixture.componentInstance.select().selectedItems.length).toBe(1);
		const selected = fixture.componentInstance.selectedCity;
		fixture.componentInstance.cities = [];
		fixture.detectChanges();

		fixture.componentInstance.select().clearItem(selected);
		expect(fixture.componentInstance.select().selectedItems.length).toBe(0);
		await new Promise(resolve => setTimeout(resolve, 0));
	});

	it('should display custom dropdown option template', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities" [(ngModel)]="selectedCity">
						<ng-template ng-option-tmp let-item="item">
							<div class="custom-option">{{item.name}}</div>
						</ng-template>
					</ng-select>`,
		);

		fixture.componentInstance.select().open();
		fixture.detectChanges();

		await fixture.whenStable();
		const el = fixture.debugElement.query(By.css('.custom-option')).nativeElement;
		expect(el).not.toBeNull();
	});

	it('should display custom multiple label template', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities" [multiple]="true" [(ngModel)]="selectedCities">
						<ng-template ng-multi-label-tmp let-items="items">
							<div class="custom-multi-label">selected {{items.length}}</div>
						</ng-template>
					</ng-select>`,
		);

		fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		await fixture.whenStable();

		const el = fixture.debugElement.query(By.css('.custom-multi-label')).nativeElement;
		expect(el.innerHTML).toBe('selected 1');
	});

	it('should display custom footer and header template', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities" [(ngModel)]="selectedCity">
						<ng-template ng-header-tmp>
							<span class="header-label">header</span>
						</ng-template>
						<ng-template ng-footer-tmp>
							<span class="footer-label">footer</span>
						</ng-template>
					</ng-select>`,
		);

		fixture.componentInstance.select().open();
		fixture.detectChanges();

		await fixture.whenStable();
		const header = fixture.debugElement.query(By.css('.header-label')).nativeElement;
		expect(header.innerHTML).toBe('header');

		const footer = fixture.debugElement.query(By.css('.footer-label')).nativeElement;
		expect(footer.innerHTML).toBe('footer');
	});

	it('should display custom tag template', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities" [(ngModel)]="selectedCity" [addTag]="true">
						<ng-template ng-tag-tmp let-search="searchTerm">
							<span class="tag-template">{{searchTerm}}</span>
						</ng-template>
					</ng-select>`,
		);

		const select = fixture.componentInstance.select();
		select.filter('tag');
		select.open();
		fixture.detectChanges();

		await fixture.whenStable();
		const template = fixture.debugElement.query(By.css('.tag-template')).nativeElement;
		expect(template).toBeDefined();
	});

	it('should display custom loading and no data found template', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
								[loading]="citiesLoading"
								[(ngModel)]="selectedCity">

						<ng-template ng-notfound-tmp let-searchTerm="searchTerm">
							<div class="custom-notfound">
								No data found for "{{searchTerm}}"
							</div>
						</ng-template>
						<ng-template ng-loadingtext-tmp let-searchTerm="searchTerm">
							<div class="custom-loading">
								Fetching Data for "{{searchTerm}}"
							</div>
						</ng-template>
					</ng-select>`,
		);

		await fixture.whenStable();
		fixture.componentInstance.cities = [];
		fixture.componentInstance.citiesLoading = true;
		fixture.detectChanges();
		await fixture.whenStable();
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
		fixture.detectChanges();
		await fixture.whenStable();
		const loadingOption = fixture.debugElement.queryAll(By.css('.custom-loading'));
		expect(loadingOption.length).toBe(1);

		fixture.componentInstance.citiesLoading = false;
		fixture.detectChanges();
		await fixture.whenStable();
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
		fixture.detectChanges();
		await fixture.whenStable();
		const notFoundOptions = fixture.debugElement.queryAll(By.css('.custom-notfound'));
		expect(notFoundOptions.length).toBe(1);
	});

	it('should display custom type for search template', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
								[typeahead]="filter"
								[(ngModel)]="selectedCity">
						<ng-template ng-typetosearch-tmp>
							<div class="custom-typeforsearch">
								Start typing...
							</div>
						</ng-template>

					</ng-select>`,
		);

		await fixture.whenStable();
		fixture.componentInstance.cities = [];
		fixture.componentInstance.select().open();
		fixture.componentInstance.filter.subscribe();
		fixture.detectChanges();
		await fixture.whenStable();
		triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
		fixture.detectChanges();
		await fixture.whenStable();
		const loadingOption = fixture.debugElement.queryAll(By.css('.custom-typeforsearch'));
		expect(loadingOption.length).toBe(1);
	});

	it('should display custom loading spinner template', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
								[loading]="true"
								[(ngModel)]="selectedCity">

						<ng-template ng-loadingspinner-tmp>
							<div class="custom-loadingspinner">
								Custom loading spinner
							</div>
						</ng-template>
					</ng-select>`,
		);

		await fixture.whenStable();
		fixture.detectChanges();
		await fixture.whenStable();
		const spinner = fixture.debugElement.queryAll(By.css('.custom-loadingspinner'));
		expect(spinner.length).toBe(1);
	});

	it('should update ng-option state', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [(ngModel)]="selectedCity">
						<ng-option [disabled]="disabled" [value]="true">Yes</ng-option>
						<ng-option [value]="false">No</ng-option>
					</ng-select>`,
		);

		fixture.detectChanges();
		await fixture.whenStable();
		const itemsList = fixture.componentInstance.select().itemsList;
		expect(itemsList.items[0].disabled).toBeFalsy();
		fixture.componentInstance.disabled = true;
		fixture.detectChanges();
		await fixture.whenStable();
		expect(itemsList.items[0].disabled).toBeTruthy();
	});

	it('should display custom clear button template when selected city', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [items]="cities"
								[loading]="true"
								[(ngModel)]="selectedCity">

						<ng-template ng-clearbutton-tmp>
							<div class="custom-clearbutton">
								Custom clear button
							</div>
						</ng-template>
					</ng-select>`,
		);

		await fixture.whenStable();
		fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		await fixture.whenStable();
		const clear = fixture.debugElement.queryAll(By.css('.custom-clearbutton'));
		expect(clear.length).toBe(1);
	});

	it('should display ng-placeholder template', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [(ngModel)]="selectedCity">
						<ng-template ng-placeholder-tmp>
							<div class="placeholder-template">Select your city</div>
						</ng-template>
					</ng-select>`,
		);

		fixture.componentInstance.selectedCity = undefined;
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.debugElement.query(By.css('.placeholder-template')).nativeElement.innerHTML).toBe('Select your city');
		expect(fixture.debugElement.query(By.css('.ng-placeholder'))).toBeFalsy();
	});

	it('should display ng-placeholder if an item is selected', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [(ngModel)]="selectedCity" 
															[items]="cities" bindLabel="name" 
															fixedPlaceholder="true"
															placeholder="testPlaceholder">			
					</ng-select>`,
		);

		fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		await fixture.whenStable();

		expect(fixture.debugElement.query(By.css('.ng-placeholder'))).toBeTruthy();
	});

	it('should not display ng-placeholder if an item is selected', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [(ngModel)]="selectedCity"
															[fixedPlaceholder]="false"
															[items]="cities" bindLabel="name"
															placeholder="testPlaceholder">
					</ng-select>`,
		);

		fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		await fixture.whenStable();

		expect(fixture.debugElement.query(By.css('.ng-placeholder'))).toBeFalsy();
	});

	it('should update ng-option label', async () => {
		const fixture = createTestingModule(
			NgSelectTestComponent,
			`<ng-select [(ngModel)]="selectedCity">
						<ng-option [disabled]="disabled" [value]="true">{{label}}</ng-option>
						<ng-option [value]="false">No</ng-option>
					</ng-select>`,
		);

		fixture.componentInstance.label = 'Indeed';
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		await fixture.whenStable();
		const items = fixture.componentInstance.select().itemsList.items;
		expect(items[0].label).toBe('Indeed');
	});

	it('should update ng-option label after async change (delayed)', async () => {
		// Create fixture without initial detectChanges (use real NgZone for proper rendering)
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			imports: [FormsModule, NgSelectModule],
			providers: [
				{ provide: ErrorHandler, useClass: TestsErrorHandler },
				{ provide: ConsoleService, useFactory: () => new MockConsole() },
			],
		}).overrideComponent(NgSelectTestComponent, {
			set: {
				template: `<ng-select [(ngModel)]="selectedCity">
						<ng-option [value]="true">{{label}}</ng-option>
						<ng-option [value]="false">No</ng-option>
					</ng-select>`,
			},
		});
		TestBed.compileComponents();
		const fixture = TestBed.createComponent(NgSelectTestComponent);

		// Set label BEFORE first detectChanges
		fixture.componentInstance.label = '';
		await new Promise(resolve => setTimeout(resolve, 100));
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		await fixture.whenStable();

		let items = fixture.componentInstance.select().itemsList.items;
		expect(items[0].label).toBe('');

		// Simulate delayed async update (e.g., translation loaded later or signal update)
		fixture.componentInstance.label = 'worked';
		await new Promise(resolve => setTimeout(resolve, 100));
		fixture.detectChanges();
		await fixture.whenStable();
		// Wait for browser render cycle (afterEveryRender in ng-option)
		await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined))));
		fixture.detectChanges();
		await fixture.whenStable();

		items = fixture.componentInstance.select().itemsList.items;
		expect(items[0].label).toBe('worked');
	});

	it('should update ng-option value after async change (delayed)', async () => {
		// Create fixture without initial detectChanges (use real NgZone for proper rendering)
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			imports: [FormsModule, NgSelectModule],
			providers: [
				{ provide: ErrorHandler, useClass: TestsErrorHandler },
				{ provide: ConsoleService, useFactory: () => new MockConsole() },
			],
		}).overrideComponent(NgSelectTestComponent, {
			set: {
				template: `<ng-select [(ngModel)]="selectedCity">
						<ng-option [value]="cityValue">{{label}}</ng-option>
						<ng-option [value]="false">No</ng-option>
					</ng-select>`,
			},
		});
		TestBed.compileComponents();
		const fixture = TestBed.createComponent(NgSelectTestComponent);

		// Set values BEFORE first detectChanges
		fixture.componentInstance.cityValue = 'initial';
		fixture.componentInstance.label = 'Initial Label';
		await new Promise(resolve => setTimeout(resolve, 100));
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		await fixture.whenStable();

		let items = fixture.componentInstance.select().itemsList.items;
		expect(items[0].value).toBe('initial');
		expect(items[0].label).toBe('Initial Label');

		// Simulate delayed async update of value attribute
		fixture.componentInstance.cityValue = 'updated';
		fixture.componentInstance.label = 'Updated Label';
		await new Promise(resolve => setTimeout(resolve, 100));
		fixture.detectChanges();
		await fixture.whenStable();
		// Wait for browser render cycle (afterEveryRender in ng-option)
		await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined))));
		fixture.detectChanges();
		await fixture.whenStable();

		items = fixture.componentInstance.select().itemsList.items;
		expect(items[0].value).toBe('updated');
		expect(items[0].label).toBe('Updated Label');
	});

	describe('Multiple', () => {
		let fixture: ComponentFixture<NgSelectTestComponent>;
		let select: NgSelectComponent;
		beforeEach(() => {
			fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
						bindLabel="name"
						placeholder="select value"
						[(ngModel)]="selectedCities"
						[hideSelected]="hideSelected"
						[closeOnSelect]="closeOnSelect"
						[maxSelectedItems]="maxSelectedItems"
						[addTag]="addTag"
						[typeahead]="typeahead"
						[multiple]="true">
					</ng-select>`,
			);
		});

		it('should have relevant classes', () => {
			const selectElement = getNgSelectNativeElement(fixture);
			expect(selectElement).toHaveClass('ng-select');
			expect(selectElement).toHaveClass('ng-select-multiple');
		});

		it('should select several items', async () => {
			await selectOption(fixture, KeyCode.ArrowDown, 1);
			await selectOption(fixture, KeyCode.ArrowDown, 2);
			fixture.detectChanges();
			await fixture.whenStable();
			expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(2);
		});

		it('should toggle selected item', async () => {
			await selectOption(fixture, KeyCode.ArrowDown, 0);
			await selectOption(fixture, KeyCode.ArrowDown, 2);
			fixture.detectChanges();
			await fixture.whenStable();
			expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(2);

			await selectOption(fixture, KeyCode.ArrowDown, 1);
			fixture.detectChanges();
			await fixture.whenStable();
			expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(1);
			expect(fixture.componentInstance.select().selectedItems[0]).toEqual(
				jasmine.objectContaining({
					value: { id: 3, name: 'Pabrade' },
				}),
			);
		});

		it('should not toggle item on enter when dropdown is closed', async () => {
			await selectOption(fixture, KeyCode.ArrowDown, 0);
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Esc);
			expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(1);
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
			expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(1);
		});

		describe('max selected items', () => {
			let arrowIcon: DebugElement = null;
			beforeEach(() => {
				fixture.componentInstance.maxSelectedItems = 2;
				arrowIcon = fixture.debugElement.query(By.css('.ng-arrow-wrapper'));
			});

			it('should be able to select only two elements', async () => {
				await selectOption(fixture, KeyCode.ArrowDown, 0);
				await selectOption(fixture, KeyCode.ArrowDown, 1);
				await selectOption(fixture, KeyCode.ArrowDown, 1);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(2);
			});

			it('should not open dropdown when maximum of items is reached', async () => {
				const clickArrow = () => arrowIcon.triggerEventHandler('click', {});
				await selectOption(fixture, KeyCode.ArrowDown, 0);
				await selectOption(fixture, KeyCode.ArrowDown, 1);
				fixture.detectChanges();
				await fixture.whenStable();
				clickArrow();
				fixture.detectChanges();
				await fixture.whenStable();
				expect(fixture.componentInstance.select().isOpen()).toBe(false);
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(2);
			});
		});

		describe('show selected', () => {
			beforeEach(() => {
				select = fixture.componentInstance.select();
				fixture.componentInstance.hideSelected = true;
				fixture.componentInstance.closeOnSelect = false;
			});

			it('should close dropdown when all items are selected', async () => {
				await selectOption(fixture, KeyCode.ArrowDown, 1);
				await selectOption(fixture, KeyCode.ArrowDown, 1);
				await selectOption(fixture, KeyCode.ArrowDown, 1);
				expect(select.selectedItems.length).toBe(3);
				expect(select.itemsList.filteredItems.length).toBe(0);
				expect(select.isOpen()).toBeFalsy();
			});

			it('should not open dropdown when all items are selected', async () => {
				fixture.componentInstance.selectedCities = [...fixture.componentInstance.cities];
				fixture.detectChanges();
				await fixture.whenStable();
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				expect(select.selectedItems.length).toBe(3);
				expect(select.itemsList.filteredItems.length).toBe(0);
				expect(select.isOpen()).toBeFalsy();
			});

			it('should open dropdown when all items are selected and tagging is enabled', async () => {
				fixture.componentInstance.addTag = true;
				fixture.componentInstance.cities = [];
				fixture.detectChanges();
				await fixture.whenStable();
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				expect(select.isOpen()).toBeTruthy();
			});

			it('should not insert option back to list if it is newly created option', async () => {
				fixture.componentInstance.addTag = true;
				fixture.componentInstance.typeahead = new Subject();
				fixture.detectChanges();
				await fixture.whenStable();
				select.typeahead().subscribe();
				fixture.componentInstance.cities = [];
				fixture.detectChanges();
				await fixture.whenStable();
				fixture.componentInstance.select().filter('New item');
				fixture.detectChanges();
				await fixture.whenStable();
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);

				expect(select.selectedItems.length).toBe(1);
				expect(select.items().length).toBe(0);
				select.unselect(select.selectedItems[0]);
				fixture.detectChanges();
				await fixture.whenStable();
				expect(select.itemsList.filteredItems.length).toBe(0);
			});

			it('should remove selected item from items list', async () => {
				fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
				fixture.detectChanges();
				await fixture.whenStable();
				expect(select.selectedItems.length).toBe(1);
				expect(select.itemsList.filteredItems.length).toBe(2);
			});

			it('should put unselected item back to list', async () => {
				fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
				fixture.detectChanges();
				await fixture.whenStable();
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Backspace);
				expect(fixture.componentInstance.select().selectedItems.length).toBe(0);
				expect(fixture.componentInstance.select().itemsList.filteredItems.length).toBe(3);
			});

			it('should keep same ordering while unselecting', async () => {
				fixture.componentInstance.selectedCities = [...fixture.componentInstance.cities.reverse()];
				fixture.detectChanges();
				await fixture.whenStable();
				select.unselect(select.selectedItems[0]);
				select.unselect(select.selectedItems[0]);
				select.unselect(select.selectedItems[0]);
				expect(select.selectedItems.length).toBe(0);
				expect(select.itemsList.filteredItems.length).toBe(3);
				expect(select.itemsList.filteredItems[0].label).toBe('Vilnius');
				expect(select.itemsList.filteredItems[1].label).toBe('Kaunas');
				expect(select.itemsList.filteredItems[2].label).toBe('Pabrade');
			});

			it('should reset list while clearing all selected items', async () => {
				fixture.componentInstance.selectedCities = [...fixture.componentInstance.cities];
				fixture.detectChanges();
				await fixture.whenStable();
				select.handleClearClick();
				expect(select.selectedItems.length).toBe(0);
				expect(select.itemsList.filteredItems.length).toBe(3);
			});

			it('should skip selected items while filtering', async () => {
				fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
				fixture.detectChanges();
				await fixture.whenStable();
				select.filter('s');
				fixture.detectChanges();
				await fixture.whenStable();
				expect(select.itemsList.filteredItems.length).toBe(1);
				expect(select.itemsList.filteredItems[0].label).toBe('Kaunas');
				select.filter('');
				fixture.detectChanges();
				await fixture.whenStable();
				expect(select.itemsList.filteredItems.length).toBe(2);
			});
		});
	});

	describe('Deselecting items', () => {
		describe('Multiple', () => {
			it('should not toggle selected item when deselectOnClick is false', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
							bindLabel="name"
							[multiple]="true"
							[deselectOnClick]="false">
						</ng-select>`,
				);

				await selectOption(fixture, KeyCode.ArrowDown, 0);
				await selectOption(fixture, KeyCode.ArrowDown, 2);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(2);

				await selectOption(fixture, KeyCode.ArrowDown, 1);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(2);
				expect(fixture.componentInstance.select().selectedItems[0]).toEqual(
					jasmine.objectContaining({
						value: { id: 1, name: 'Vilnius' },
					}),
				);
			});

			it('should toggle selected item when deselectOnClick is true', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
							bindLabel="name"
							[multiple]="true"
							[deselectOnClick]="true">
						</ng-select>`,
				);

				await selectOption(fixture, KeyCode.ArrowDown, 0);
				await selectOption(fixture, KeyCode.ArrowDown, 2);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(2);

				await selectOption(fixture, KeyCode.ArrowDown, 1);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(1);
				expect(fixture.componentInstance.select().selectedItems[0]).toEqual(
					jasmine.objectContaining({
						value: { id: 3, name: 'Pabrade' },
					}),
				);
			});

			it('should toggle selected item when deselectOnClick is undefined', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
							bindLabel="name"
							[multiple]="true">
						</ng-select>`,
				);

				await selectOption(fixture, KeyCode.ArrowDown, 0);
				await selectOption(fixture, KeyCode.ArrowDown, 2);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(2);

				await selectOption(fixture, KeyCode.ArrowDown, 1);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(1);
				expect(fixture.componentInstance.select().selectedItems[0]).toEqual(
					jasmine.objectContaining({
						value: { id: 3, name: 'Pabrade' },
					}),
				);
			});
		});

		describe('Single', () => {
			it('should not toggle selected item when deselectOnClick is false', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
							bindLabel="name"
							[deselectOnClick]="false">
						</ng-select>`,
				);

				await selectOption(fixture, KeyCode.ArrowDown, 0);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(1);

				await selectOption(fixture, KeyCode.ArrowDown, 0);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(1);
				expect(fixture.componentInstance.select().selectedItems[0]).toEqual(
					jasmine.objectContaining({
						value: { id: 1, name: 'Vilnius' },
					}),
				);
			});

			it('should toggle selected item when deselectOnClick is true', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
							bindLabel="name"
							[deselectOnClick]="true">
						</ng-select>`,
				);

				await selectOption(fixture, KeyCode.ArrowDown, 0);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(1);

				await selectOption(fixture, KeyCode.ArrowDown, 0);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(0);
			});

			it('should not toggle selected item when deselectOnClick is undefined', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
							bindLabel="name">
						</ng-select>`,
				);

				await selectOption(fixture, KeyCode.ArrowDown, 0);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(1);

				await selectOption(fixture, KeyCode.ArrowDown, 0);
				fixture.detectChanges();
				await fixture.whenStable();
				expect((<NgOption[]>fixture.componentInstance.select().selectedItems).length).toBe(1);
				expect(fixture.componentInstance.select().selectedItems[0]).toEqual(
					jasmine.objectContaining({
						value: { id: 1, name: 'Vilnius' },
					}),
				);
			});
		});
	});

	describe('Tagging', () => {
		it('should select default tag', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                    bindLabel="name"
                    [addTag]="true"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.select().filter('new tag');
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
			expect(fixture.componentInstance.selectedCity.name).toBe('new tag');
		});

		it('should add tag as string', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="citiesNames"
                    [addTag]="true"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.select().filter('Copenhagen');
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
			expect(fixture.componentInstance.selectedCity).toBe(<any>'Copenhagen');
		});

		it('should add tag as string when there are no items', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="[]"
                    [addTag]="true"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.select().filter('Copenhagen');
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
			expect(fixture.componentInstance.selectedCity).toBe(<any>'Copenhagen');
			expect(fixture.componentInstance.select().itemsList.filteredItems.length).toBe(1);
		});

		it('should not add item to list when select is closed', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="[]"
                    [isOpen]="false"
                    [addTag]="true"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.select().filter('Copenhagen');
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
			expect(fixture.componentInstance.select().itemsList.filteredItems.length).toBe(0);
		});

		it('should add tag as string when tab pressed', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="citiesNames"
                    [addTag]="true"
                    [selectOnTab]="true"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.select().filter('Copenhagen');
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
			expect(fixture.componentInstance.selectedCity).toBe(<any>'Copenhagen');
		});

		it('should select tag even if there are filtered items that matches search term', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                    bindLabel="name"
                    [addTag]="true"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.select().filter('Vil');
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.ArrowDown);
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
			expect(fixture.componentInstance.selectedCity.name).toBe('Vil');
		});

		it('should select custom tag', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                    bindLabel="name"
                    [addTag]="tagFunc"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.select().filter('custom tag');
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
			expect(<any>fixture.componentInstance.selectedCity).toEqual(
				jasmine.objectContaining({
					id: 'custom tag',
					name: 'custom tag',
					custom: true,
				}),
			);
		});

		it('should select custom tag with promise', async () => {
			const fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                    bindLabel="name"
                    [addTag]="tagFuncPromise"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
			);

			fixture.detectChanges();
			await fixture.whenStable();
			fixture.componentInstance.select().filter('server side tag');
			fixture.detectChanges();
			await fixture.whenStable();
			triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
			await new Promise(resolve => setTimeout(resolve, 0));
			expect(<any>fixture.componentInstance.selectedCity).toEqual(
				jasmine.objectContaining({
					id: 5,
					name: 'server side tag',
					valid: true,
				}),
			);
		});

		describe('show add tag', () => {
			let select: NgSelectComponent;
			let fixture: ComponentFixture<NgSelectTestComponent>;
			beforeEach(() => {
				fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
						bindLabel="name"
						[multiple]="true"
						[addTag]="true"
						[minTermLength]="minTermLength"
						[hideSelected]="hideSelected"
						placeholder="select value"
						[(ngModel)]="selectedCities">
					</ng-select>`,
				);
				select = fixture.componentInstance.select();
			});

			it('should be false when there is no search term', () => {
				select.filter(null);
				expect(select.showAddTag).toBeFalsy();
			});

			it('should be false when term is too short', () => {
				select.filter('vi');
				fixture.componentInstance.minTermLength = 3;
				fixture.detectChanges();
				expect(select.showAddTag).toBeFalsy();
			});

			it('should be true when term not exists among items', () => {
				select.filter('Vil');
				expect(select.showAddTag).toBeTruthy();
			});

			it('should be false when term exists among items', () => {
				select.filter('Vilnius');
				expect(select.showAddTag).toBeFalsy();
			});

			it('should be false when term exists among selected items', async () => {
				fixture.componentInstance.hideSelected = true;
				select.filter('Palanga');
				fixture.detectChanges();
				await fixture.whenStable();
				fixture.componentInstance.selectedCities = [{ name: 'Palanga', id: 9 }];
				fixture.detectChanges();
				await fixture.whenStable();
				expect(select.showAddTag).toBeFalsy();
			});

			it('should be false when term exists among selected items and select is closed', async () => {
				fixture.componentInstance.hideSelected = false;
				select.filter('Palanga');
				fixture.detectChanges();
				await fixture.whenStable();
				fixture.componentInstance.selectedCities = [{ name: 'Palanga', id: 9 }];
				select.isOpen.set(false);
				fixture.detectChanges();
				await fixture.whenStable();
				expect(select.showAddTag).toBeFalsy();
			});

			it('should be false when there is search term with only empty space', () => {
				triggerKeyDownEvent(getNgSelectElement(fixture), '   ');
				expect(select.showAddTag).toBeFalsy();
			});
		});
	});

	describe('Placeholder', () => {
		let fixture: ComponentFixture<NgSelectTestComponent>;
		beforeEach(() => {
			fixture = createTestingModule(
				NgSelectTestComponent,
				`<ng-select [items]="cities"
                    bindLabel="name"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
			);
		});

		it('should be visible when no value selected', async () => {
			fixture.detectChanges();
			await fixture.whenStable();
			const element = fixture.componentInstance.select().element;
			const placeholder: any = element.querySelector('.ng-placeholder');
			expect(placeholder.innerText).toBe('select value');
			expect(getComputedStyle(placeholder).display).toBe('block');
		});

		it('should be visible when value was cleared', async () => {
			const select = fixture.componentInstance.select();
			fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();
			await fixture.whenStable();
			const element = fixture.componentInstance.select().element;
			const ngControl = element.querySelector('.ng-select-container');

			expect(ngControl.classList.contains('ng-has-value')).toBeTruthy();

			select.handleClearClick();
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();
			await fixture.whenStable();

			const placeholder = element.querySelector('.ng-placeholder');
			expect(ngControl.classList.contains('ng-has-value')).toBeFalsy();
			expect(getComputedStyle(placeholder).display).toBe('block');
		});

		it('should contain .ng-has-value when value was selected', async () => {
			fixture.detectChanges();
			await fixture.whenStable();
			const element = fixture.componentInstance.select().element;
			const ngControl = element.querySelector('.ng-select-container');
			await selectOption(fixture, KeyCode.ArrowDown, 2);
			fixture.detectChanges();
			await fixture.whenStable();
			expect(ngControl.classList.contains('ng-has-value')).toBeTruthy();
		});

		describe('Filter', () => {
			it('should filter using default implementation', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				await new Promise(resolve => setTimeout(resolve, 200));
				fixture.componentInstance.select().filter('vilnius');
				await new Promise(resolve => setTimeout(resolve, 200));

				const result = [
					jasmine.objectContaining({
						value: { id: 1, name: 'Vilnius' },
					}),
				];
				expect(fixture.componentInstance.select().itemsList.filteredItems).toEqual(result);
			});

			it('should filter using custom searchFn', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                    bindLabel="name"
                    [searchFn]="searchFn"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				fixture.componentInstance.searchFn = (term: string, item: any) => item.name.indexOf(term) > -1 || item.id === 2;
				const select = fixture.componentInstance.select();
				fixture.detectChanges();
				await fixture.whenStable();
				select.filter('Vilnius');
				await new Promise(resolve => setTimeout(resolve, 200));

				expect(select.itemsList.filteredItems.length).toEqual(2);
				expect(select.itemsList.filteredItems[0]).toEqual(
					jasmine.objectContaining({
						value: { id: 1, name: 'Vilnius' },
					}),
				);
				expect(select.itemsList.filteredItems[1]).toEqual(
					jasmine.objectContaining({
						value: { id: 2, name: 'Kaunas' },
					}),
				);
			});

			it('should toggle dropdown when searchable false', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                    bindLabel="name"
                    [searchable]="false"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				const selectInput = fixture.debugElement.query(By.css('.ng-select-container'));
				// open
				selectInput.triggerEventHandler('mousedown', createEvent());
				fixture.detectChanges();
				await fixture.whenStable();
				expect(fixture.componentInstance.select().isOpen()).toBe(true);

				// close
				selectInput.triggerEventHandler('mousedown', createEvent());
				fixture.detectChanges();
				await fixture.whenStable();
				expect(fixture.componentInstance.select().isOpen()).toBe(false);
			});

			it('should not filter when searchable false', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                    bindLabel="name"
                    [searchable]="false"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				const select = fixture.componentInstance.select();
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				triggerKeyDownEvent(getNgSelectElement(fixture), 'v');
				await new Promise(resolve => setTimeout(resolve, 200));
				fixture.detectChanges();

				const input: HTMLInputElement = select.element.querySelector('input');
				expect(select.searchTerm).toBeNull();
				expect(input.readOnly).toBeTruthy();
			});

			it('should mark first item on filter', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				await new Promise(resolve => setTimeout(resolve, 200));
				fixture.componentInstance.select().filter('pab');
				await new Promise(resolve => setTimeout(resolve, 200));

				const result = jasmine.objectContaining({
					value: fixture.componentInstance.cities[2],
				});
				expect(fixture.componentInstance.select().itemsList.markedItem).toEqual(result);
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
				expect(fixture.componentInstance.select().selectedItems).toEqual([result]);
			});

			it('should not mark first item when isOpen is false', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                    bindLabel="name"
                    [isOpen]="false"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				await new Promise(resolve => setTimeout(resolve, 200));
				fixture.componentInstance.select().filter('pab');
				await new Promise(resolve => setTimeout(resolve, 200));

				expect(fixture.componentInstance.select().itemsList.markedItem).toBeUndefined();
			});

			it('should mark first item on filter when selected is not among filtered items', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
				fixture.detectChanges();
				fixture.componentInstance.select().filter('pab');
				await new Promise(resolve => setTimeout(resolve, 0));

				const result = jasmine.objectContaining({
					value: fixture.componentInstance.cities[2],
				});
				expect(fixture.componentInstance.select().itemsList.markedItem).toEqual(result);
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
				expect(fixture.componentInstance.select().selectedItems).toEqual([result]);
			});

			it('should not mark first item on filter when markFirst disabled', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                    bindLabel="name"
                    [markFirst]="false"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				await new Promise(resolve => setTimeout(resolve, 200));
				fixture.componentInstance.select().filter('pab');
				await new Promise(resolve => setTimeout(resolve, 0));
				expect(fixture.componentInstance.select().itemsList.markedItem).toEqual(undefined);
			});

			it('should clear filterValue on selected item', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity"
                    [multiple]="true">
                </ng-select>`,
				);

				const select = fixture.componentInstance.select();
				fixture.detectChanges();
				await fixture.whenStable();
				triggerKeyDownEvent(getNgSelectElement(fixture), 'Hey! Whats up!?');
				await selectOption(fixture, KeyCode.ArrowDown, 1);
				fixture.detectChanges();
				await fixture.whenStable();
				expect(select.searchTerm).toBe(null);
			});

			it('should not reset items when selecting option', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity"
                    [multiple]="true">
                </ng-select>`,
				);

				fixture.detectChanges();
				await fixture.whenStable();
				fixture.componentInstance.select().filter(null);
				const resetFilteredItemsSpy = vi.spyOn(fixture.componentInstance.select().itemsList, 'resetFilteredItems');

				await selectOption(fixture, KeyCode.ArrowDown, 1);
				fixture.detectChanges();
				await fixture.whenStable();
				expect(resetFilteredItemsSpy).not.toHaveBeenCalled();
			});

			it('should filter grouped items', async () => {
				const fixture = createTestingModule(
					NgSelectGroupingTestComponent,
					`<ng-select [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        [(ngModel)]="selectedAccount">
                </ng-select>`,
				);

				fixture.detectChanges();
				await fixture.whenStable();
				fixture.componentInstance.select().filter('adam');
				fixture.detectChanges();
				await fixture.whenStable();

				const filteredItems = fixture.componentInstance.select().itemsList.filteredItems;
				expect(filteredItems.length).toBe(2);
				expect(filteredItems[0].children).toBeDefined();
				expect(filteredItems[0].label).toBe('United States');
				expect(filteredItems[1].parent).toBe(filteredItems[0]);
				expect(filteredItems[1].label).toBe('Adam');
			});

			it('should continue filtering items on update of items', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
				);
				fixture.detectChanges();
				await fixture.whenStable();

				fixture.componentInstance.select().filter('vil');
				fixture.detectChanges();
				await fixture.whenStable();

				let result = [
					jasmine.objectContaining({
						value: { id: 1, name: 'Vilnius' },
					}),
				];
				expect(fixture.componentInstance.select().itemsList.filteredItems).toEqual(result);

				fixture.componentInstance.cities = [
					{ id: 1, name: 'Vilnius' },
					{ id: 2, name: 'Kaunas' },
					{
						id: 3,
						name: 'Pabrade',
					},
					{ id: 4, name: 'Bruchhausen-Vilsen' },
				];
				fixture.detectChanges();
				await fixture.whenStable();

				result = [
					jasmine.objectContaining({
						value: { id: 1, name: 'Vilnius' },
					}),
					jasmine.objectContaining({
						value: { id: 4, name: 'Bruchhausen-Vilsen' },
					}),
				];
				expect(fixture.componentInstance.select().itemsList.filteredItems).toEqual(result);
			});

			describe('with typeahead', () => {
				let fixture: ComponentFixture<NgSelectTestComponent>;
				beforeEach(() => {
					fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                        [typeahead]="filter"
                        [minTermLength]="minTermLength"
                        bindLabel="name"
						[markFirst]="markFirst"
                        [hideSelected]="hideSelected"
                        [(ngModel)]="selectedCity">
                    </ng-select>`,
					);
				});

				it('should not show selected city among options if it does not match search term', async () => {
					fixture.componentInstance.selectedCity = { id: 9, name: 'Copenhagen' };
					fixture.detectChanges();
					await fixture.whenStable();

					fixture.componentInstance.filter.subscribe();
					fixture.componentInstance.select().filter('new');
					fixture.componentInstance.cities = [{ id: 4, name: 'New York' }];
					fixture.detectChanges();
					await fixture.whenStable();
					expect(fixture.componentInstance.select().itemsList.filteredItems.length).toBe(1);
					expect(fixture.componentInstance.select().itemsList.filteredItems[0]).toEqual(
						jasmine.objectContaining({
							value: { id: 4, name: 'New York' },
						}),
					);
				});

				it('should push term to custom observable', async () => {
					fixture.componentInstance.filter.subscribe();
					const next = vi.spyOn(fixture.componentInstance.filter, 'next');
					fixture.componentInstance.select().filter('vilnius');
					fixture.detectChanges();
					await fixture.whenStable();
					expect(next).toHaveBeenCalledWith('vilnius');
				});

				it('should push term to custom observable', async () => {
					fixture.componentInstance.filter.subscribe();
					const next = vi.spyOn(fixture.componentInstance.filter, 'next');
					fixture.componentInstance.select().filter('');
					fixture.detectChanges();
					await fixture.whenStable();
					expect(next).toHaveBeenCalledWith('');
				});

				it('should not push term to custom observable if length is less than minTermLength', async () => {
					fixture.componentInstance.minTermLength = 2;
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.componentInstance.filter.subscribe();
					const next = vi.spyOn(fixture.componentInstance.filter, 'next');
					fixture.componentInstance.select().filter('v');
					fixture.detectChanges();
					await fixture.whenStable();
					expect(next).not.toHaveBeenCalledWith('v');
				});

				it('should mark first item when typeahead results are loaded', async () => {
					fixture.componentInstance.filter.subscribe();
					fixture.componentInstance.select().filter('buk');
					fixture.componentInstance.cities = [{ id: 4, name: 'Bukiskes' }];
					fixture.detectChanges();
					await fixture.whenStable();
					triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
					expect(fixture.componentInstance.select().selectedItems).toEqual([
						jasmine.objectContaining({
							value: { id: 4, name: 'Bukiskes' },
						}),
					]);
				});

				it('should not mark first item when typeahead results are loaded', async () => {
					fixture.componentInstance.markFirst = false;
					fixture.detectChanges();
					fixture.componentInstance.filter.subscribe();
					fixture.componentInstance.select().filter('buk');
					fixture.componentInstance.cities = [{ id: 4, name: 'Bukiskes' }];
					fixture.detectChanges();
					await fixture.whenStable();
					triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
					expect(fixture.componentInstance.select().selectedItems).toEqual([]);
				});

				it('should open dropdown when hideSelected=true and no items to select', async () => {
					fixture.componentInstance.hideSelected = true;
					fixture.componentInstance.cities = [];
					fixture.componentInstance.selectedCity = null;
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.componentInstance.filter.subscribe();
					fixture.componentInstance.select().open();
					expect(fixture.componentInstance.select().isOpen()).toBeTruthy();
				});

				describe('search text', () => {
					it('should be visible until minTermLength reached', async () => {
						fixture.componentInstance.cities = [];
						fixture.componentInstance.minTermLength = 3;
						fixture.componentInstance.filter.subscribe();
						fixture.componentInstance.select().filter('vi');
						fixture.detectChanges();
						await fixture.whenStable();
						expect(fixture.componentInstance.select().showTypeToSearch()).toBeTruthy();
					});

					it('should not be visible when valid search term is present', async () => {
						fixture.componentInstance.cities = [];
						fixture.componentInstance.minTermLength = 0;
						fixture.componentInstance.filter.subscribe();
						fixture.componentInstance.select().filter('v');
						fixture.detectChanges();
						await fixture.whenStable();
						expect(fixture.componentInstance.select().showTypeToSearch()).toBeFalsy();
					});
				});
			});

			describe('clear on add', () => {
				it('should clear search term by default', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                        [typeahead]="filter"
                        bindLabel="name"
                        [hideSelected]="hideSelected"
                        [(ngModel)]="selectedCity">
                    </ng-select>`,
					);

					expect(fixture.componentInstance.select().clearSearchOnAddValue()).toBeTruthy();

					fixture.componentInstance.filter.subscribe();
					fixture.componentInstance.cities = [{ id: 4, name: 'New York' }];
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.componentInstance.select().filter('new');
					expect(fixture.componentInstance.select().itemsList.filteredItems.length).toBe(1);
					expect(fixture.componentInstance.select().searchTerm).toBe('new');

					const select = fixture.componentInstance.select();
					fixture.componentInstance.select().select(select.viewPortItems[0]);
					expect(select.searchTerm).toBeNull();
				});

				it('should not clear search term by default when closeOnSelect is false ', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                        [typeahead]="filter"
                        bindLabel="name"
                        [hideSelected]="hideSelected"
                        [closeOnSelect]="false"
                        [(ngModel)]="selectedCity">
                    </ng-select>`,
					);

					expect(fixture.componentInstance.select().clearSearchOnAddValue()).toBeFalsy();

					fixture.componentInstance.filter.subscribe();
					fixture.componentInstance.cities = [{ id: 4, name: 'New York' }];
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.componentInstance.select().filter('new');

					const select = fixture.componentInstance.select();
					fixture.componentInstance.select().select(select.viewPortItems[0]);
					expect(select.itemsList.filteredItems.length).toBe(1);
					expect(select.searchTerm).toBe('new');
				});

				it('should not clear search term when clearSearchOnAdd is false', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                        [typeahead]="filter"
                        bindLabel="name"
                        [hideSelected]="hideSelected"
                        [clearSearchOnAdd]="false"
                        [closeOnSelect]="false"
                        [(ngModel)]="selectedCity">
                    </ng-select>`,
					);

					expect(fixture.componentInstance.select().clearSearchOnAddValue()).toBeFalsy();
					expect(fixture.componentInstance.select().closeOnSelect()).toBeFalsy();

					fixture.componentInstance.filter.subscribe();
					const select = fixture.componentInstance.select();
					select.filter('new');
					fixture.componentInstance.cities = [
						{ id: 4, name: 'New York' },
						{ id: 5, name: 'California' },
					];
					fixture.detectChanges();
					await fixture.whenStable();
					select.select(select.viewPortItems[0]);
					expect(select.searchTerm).toBe('new');
				});

				it('should update the typeahead term when the search is cleared on add', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                        [typeahead]="filter"
                        bindLabel="name"
                        [hideSelected]="hideSelected"
                        [clearSearchOnAdd]="true"
                        [closeOnSelect]="false"
                        [(ngModel)]="selectedCity">
                    </ng-select>`,
					);

					expect(fixture.componentInstance.select().clearSearchOnAddValue()).toBeTruthy();
					expect(fixture.componentInstance.select().closeOnSelect()).toBeFalsy();

					let lastEmittedSearchTerm = '';
					fixture.componentInstance.filter.subscribe((value) => {
						lastEmittedSearchTerm = value;
					});
					fixture.componentInstance.cities = [
						{ id: 4, name: 'New York' },
						{ id: 5, name: 'California' },
					];
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.componentInstance.select().filter('new');
					expect(lastEmittedSearchTerm).toBe('new');
					fixture.componentInstance.select().select(fixture.componentInstance.select().viewPortItems[0]);
					expect(lastEmittedSearchTerm).toBe(null);
				});

				it('should respect NgSelectConfig.clearSearchOnAdd if defined', async () => {
					const config = new NgSelectConfig();
					config.clearSearchOnAdd = true;
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                        [typeahead]="filter"
                        bindLabel="name"
                        [hideSelected]="hideSelected"
                        [closeOnSelect]="false"
                        [(ngModel)]="selectedCity">
                    </ng-select>`,
						config,
					);

					expect(fixture.componentInstance.select().clearSearchOnAddValue()).toBeTruthy();

					fixture.componentInstance.filter.subscribe();
					fixture.componentInstance.select().filter('new');
					fixture.componentInstance.cities = [{ id: 4, name: 'New York' }];
					fixture.detectChanges();
					await fixture.whenStable();

					const select = fixture.componentInstance.select();
					fixture.componentInstance.select().select(select.viewPortItems[0]);
					expect(select.itemsList.filteredItems.length).toBe(1);
					expect(select.searchTerm).toBe(null);
				});

				it('should allow user to override NgSelectConfig.clearSearchOnAdd on a per component basis', async () => {
					const config = new NgSelectConfig();
					config.clearSearchOnAdd = true;
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                        [typeahead]="filter"
                        bindLabel="name"
                        [hideSelected]="hideSelected"
                        [closeOnSelect]="false"
                        [clearSearchOnAdd]="false"
                        [(ngModel)]="selectedCity">
                    </ng-select>`,
						config,
					);

					expect(fixture.componentInstance.select().clearSearchOnAddValue()).toBeFalsy();

					fixture.componentInstance.filter.subscribe();
					const select = fixture.componentInstance.select();
					select.filter('new');
					fixture.componentInstance.cities = [{ id: 4, name: 'New York' }];
					fixture.detectChanges();
					await fixture.whenStable();

					select.select(select.viewPortItems[0]);
					expect(select.itemsList.filteredItems.length).toBe(1);
					expect(select.searchTerm).toBe('new');
				});
			});

			describe('edit search query', () => {
				it('should allow edit search if option selected & input focused', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                        [typeahead]="filter"
                        [editableSearchTerm]="true"
                        bindValue="id"
                        bindLabel="name"
                        [(ngModel)]="selectedCity">
                    </ng-select>`,
					);
					expect(fixture.componentInstance.select().editableSearchTerm()).toBeTruthy();
					const select = fixture.componentInstance.select();
					const input = select.searchInput().nativeElement;
					const selectedCity = fixture.componentInstance.cities[0];
					fixture.componentInstance.selectedCity = selectedCity.id;
					fixture.detectChanges();
					await fixture.whenStable();
					input.focus();
					await new Promise(resolve => setTimeout(resolve, 2000));
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(select.searchTerm).toEqual(selectedCity.name);
					expect(input.value).toEqual(selectedCity.name);
				});

				it('should display all items if wrong query passed & dropdown reopened', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                        [typeahead]="filter"
                        [editableSearchTerm]="true"
                        bindValue="id"
                        bindLabel="name"
                        [(ngModel)]="selectedCity">
                    </ng-select>`,
					);
					const select = fixture.componentInstance.select();
					const input = select.searchInput().nativeElement;
					const selectedCity = fixture.componentInstance.cities[0];
					const wrongSearchTerm = 'some wrong search';
					const selectConfig = new NgSelectConfig();
					fixture.componentInstance.selectedCity = selectedCity.id;
					fixture.detectChanges();
					await fixture.whenStable();
					input.focus();
					input.value = wrongSearchTerm;
					input.dispatchEvent(new Event('input'));
					fixture.detectChanges();
					await fixture.whenStable();
					expect(select.searchTerm).toEqual(wrongSearchTerm);
					const firstOption = select.element.querySelector('.ng-dropdown-panel .ng-option');
					expect(firstOption.innerHTML).toEqual(selectConfig.notFoundText);
					input.blur();
					select.close();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(select.isOpen()).toBeFalsy();
					input.value = '';
					input.focus();
					input.dispatchEvent(new Event('input'));
					fixture.detectChanges();
					await fixture.whenStable();
					const allOptions = select.element.querySelectorAll('.ng-dropdown-panel .ng-option');
					expect(allOptions.length).toEqual(fixture.componentInstance.cities.length);
				});

				it('should update search term when ngModel is updated programmatically', async () => {
					const fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                        [editableSearchTerm]="true"
                        bindValue="id"
                        bindLabel="name"
                        [(ngModel)]="selectedCity">
                    </ng-select>`,
					);
					const select = fixture.componentInstance.select();
					const selectedCity = fixture.componentInstance.cities[0];

					// Update ngModel programmatically (simulating writeValue)
					fixture.componentInstance.selectedCity = selectedCity.id;
					fixture.detectChanges();
					await fixture.whenStable();

					// The search term should be updated to match the selected item's label
					expect(select.searchTerm).toEqual(selectedCity.name);
				});
			});
		});

		describe('Accessibility', () => {
			let fixture: ComponentFixture<NgSelectTestComponent>;
			let select: NgSelectComponent;
			let input: HTMLInputElement;
			let comboBoxDiv: HTMLDivElement;

			beforeEach(async () => {
				fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                        labelForId="lbl"
                        (change)="onChange($event)"
                        notFoundText="No items found (aria-live)"
                        bindLabel="name">
                </ng-select>`,
				);
				select = fixture.componentInstance.select();
				input = fixture.debugElement.query(By.css('input')).nativeElement;
				comboBoxDiv = fixture.debugElement.query(By.css('.ng-input')).nativeElement;
			});

			it('should set aria-activedescendant absent at start', async () => {
				expect(input.hasAttribute('aria-activedescendant')).toBe(false);
			});

			it('should set aria-expanded to false at start', async () => {
				expect(input.getAttribute('aria-expanded')).toBe('false');
			});

			it('should set aria-expanded to true on open', async () => {
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				fixture.detectChanges();
				await fixture.whenStable();

				expect(input.getAttribute('aria-expanded')).toBe('true');
			});

			it('should set aria-controls absent at start', async () => {
				expect(input.hasAttribute('aria-controls')).toBe(false);
			});

			it('should set aria-controls to dropdownId on open', async () => {
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				fixture.detectChanges();
				await fixture.whenStable();

				expect(input.getAttribute('aria-controls')).toBe(select.dropdownId);
			});

			it('should set aria-activedecendant equal to chosen item on open', async () => {
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				fixture.detectChanges();
				await fixture.whenStable();
				expect(input.getAttribute('aria-activedescendant')).toBe(select.itemsList.markedItem.htmlId);
			});

			it('should set aria-activedecendant equal to chosen item on arrow down', async () => {
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				fixture.detectChanges();
				await fixture.whenStable();
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.ArrowDown);
				fixture.detectChanges();
				await fixture.whenStable();
				expect(input.getAttribute('aria-activedescendant')).toBe(select.itemsList.markedItem.htmlId);
			});

			it('should set aria-activedecendant equal to chosen item on arrow up', async () => {
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				fixture.detectChanges();
				await fixture.whenStable();
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.ArrowUp);
				fixture.detectChanges();
				await fixture.whenStable();
				expect(input.getAttribute('aria-activedescendant')).toBe(select.itemsList.markedItem.htmlId);
			});

			it('should set aria-activedescendant absent on dropdown close', async () => {
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				fixture.detectChanges();
				await fixture.whenStable();
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
				fixture.detectChanges();
				await fixture.whenStable();
				expect(input.hasAttribute('aria-activedescendant')).toBe(false);
			});

			it('should add labelForId on filter input id attribute', async () => {
				fixture.detectChanges();
				await fixture.whenStable();
				expect(input.getAttribute('id')).toEqual('lbl');
			});

			it('should show undefined for aria-label on input element', () => {
				expect(input.getAttribute('aria-label')).toBe(null);
			});

			it('should set aria-label on input element', () => {
				input.setAttribute('aria-label', 'test');
				expect(input.getAttribute('aria-label')).toBe('test');
			});

			it('should announce notFoundText in aria-live region when dropdown is open and no items match', async () => {
				const select = fixture.componentInstance.select();

				// Open dropdown
				select.open();
				fixture.detectChanges();
				await fixture.whenStable();

				// Filter to a non-existent item
				select.filter('not-in-list');
				fixture.detectChanges();
				await fixture.whenStable();

				const notFoundText = fixture.componentInstance.select().notFoundText();
				expect(notFoundText).toBe('No items found (aria-live)');
			});
		});

		describe('Output events', () => {
			it('should fire open event once', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                            (open)="onOpen()"
                            [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				vi.spyOn(fixture.componentInstance, 'onOpen');

				fixture.componentInstance.select().open();
				fixture.componentInstance.select().open();
				fixture.detectChanges();
				await fixture.whenStable();

				expect(fixture.componentInstance.onOpen).toHaveBeenCalledTimes(1);
			});

			it('should fire search event', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                            (search)="onSearch($event)"
                            [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				vi.spyOn(fixture.componentInstance, 'onSearch');

				fixture.componentInstance.select().filter('term');
				fixture.detectChanges();
				await fixture.whenStable();

				expect(fixture.componentInstance.onSearch).toHaveBeenCalledTimes(1);
				expect(fixture.componentInstance.onSearch).toHaveBeenCalledWith({ term: 'term', items: [] });
			});

			it('should fire close event once', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                            (close)="onClose()"
                            [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				vi.spyOn(fixture.componentInstance, 'onClose');

				fixture.componentInstance.select().open();
				fixture.componentInstance.select().close();
				fixture.componentInstance.select().close();
				fixture.detectChanges();
				await fixture.whenStable();

				expect(fixture.componentInstance.onClose).toHaveBeenCalledTimes(1);
			});

			it('should fire change when changed', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                            bindValue="id"
                            bindLabel="name"
                            (change)="onChange($event)"
                            [(ngModel)]="selectedCityId">
                </ng-select>`,
				);

				vi.spyOn(fixture.componentInstance, 'onChange');

				fixture.componentInstance.selectedCityId = fixture.componentInstance.cities[1].id;
				fixture.detectChanges();
				await fixture.whenStable();

				const select = fixture.componentInstance.select();
				select.select(select.itemsList.items[0]);
				fixture.detectChanges();
				await fixture.whenStable();

				expect(fixture.componentInstance.onChange).toHaveBeenCalledWith(select.selectedItems[0].value);
				expect(fixture.componentInstance.selectedCityId).toBe(fixture.componentInstance.cities[0].id);
			});

			it('should not fire change when item not changed', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                            (change)="onChange()"
                            [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				vi.spyOn(fixture.componentInstance, 'onChange');

				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);

				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
				triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);

				expect(fixture.componentInstance.onChange).toHaveBeenCalledTimes(1);
			});

			it('should fire addEvent when item is added', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                            (add)="onAdd($event)"
                            [multiple]="true"
                            [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				vi.spyOn(fixture.componentInstance, 'onAdd');

				fixture.detectChanges();
				await fixture.whenStable();
				fixture.componentInstance.select().select(fixture.componentInstance.select().itemsList.items[0]);

				expect(fixture.componentInstance.onAdd).toHaveBeenCalledWith(fixture.componentInstance.cities[0]);
			});

			it('should not fire addEvent for single select', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                            (add)="onAdd($event)"
                            [multiple]="false"
                            [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				vi.spyOn(fixture.componentInstance, 'onAdd');

				fixture.detectChanges();
				await fixture.whenStable();
				fixture.componentInstance.select().select(fixture.componentInstance.select().itemsList.items[0]);
				expect(fixture.componentInstance.onAdd).not.toHaveBeenCalled();
			});

			it('should fire remove when item is removed', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                            (remove)="onRemove($event)"
                            [multiple]="true"
                            [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				vi.spyOn(fixture.componentInstance, 'onRemove');

				fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
				fixture.detectChanges();
				await fixture.whenStable();

				fixture.componentInstance.select().unselect(fixture.componentInstance.cities[0]);

				expect(fixture.componentInstance.onRemove).toHaveBeenCalledWith(fixture.componentInstance.cities[0].value);
			});

			it('should fire clear when model is cleared using clear icon', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                            (clear)="onClear($event)"
                            [multiple]="true"
                            [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				vi.spyOn(fixture.componentInstance, 'onClear');

				fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
				fixture.detectChanges();
				await fixture.whenStable();
				fixture.componentInstance.select().handleClearClick();
				fixture.detectChanges();
				await fixture.whenStable();

				expect(fixture.componentInstance.onClear).toHaveBeenCalled();
			});
		});

		describe('Auto-focus', () => {
			it('should focus dropdown', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                            autofocus
                            bindLabel="name"
                            [multiple]="true"
                            [(ngModel)]="selectedCities">
                </ng-select>`,
				);
				const select = fixture.componentInstance.select();
				const focus = vi.spyOn(select, 'focus');
				select.ngAfterViewInit();
				expect(focus).toHaveBeenCalled();
			});
		});

		describe('Mousedown', () => {
			let fixture: ComponentFixture<NgSelectTestComponent>;
			let select: NgSelectComponent;
			let triggerMousedown = null;

			describe('dropdown click', () => {
				beforeEach(async () => {
					fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            [multiple]="true"
							[preventToggleOnRightClick]="preventToggleOnRightClick"
                            [(ngModel)]="selectedCities">
                    </ng-select>`,
					);
					select = fixture.componentInstance.select();

					fixture.detectChanges();
					await fixture.whenStable();
					fixture.detectChanges();
					await fixture.whenStable();
					triggerMousedown = () => {
						const control = fixture.debugElement.query(By.css('.ng-select-container'));
						control.triggerEventHandler('mousedown', createEvent({ className: 'ng-control' }));
					};
				});

				it('should focus dropdown', async () => {
					const focus = vi.spyOn(select, 'focus');
					triggerMousedown();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(focus).toHaveBeenCalled();
				});

				it('shouldnt focus dropdown, because prevent flag is true for right mouse click', async () => {
					fixture.componentInstance.preventToggleOnRightClick = true;
					const event = createEvent({ tagName: 'INPUT' }) as any;
					const preventDefault = vi.spyOn(event, 'preventDefault');
					triggerMousedown();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(preventDefault).not.toHaveBeenCalled();
				});
			});

			describe('input click', () => {
				let event: Event;
				beforeEach(async () => {
					fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            [multiple]="true"
                            [(ngModel)]="selectedCities">
                    </ng-select>`,
					);
					select = fixture.componentInstance.select();

					event = createEvent({ tagName: 'INPUT' }) as any;
					triggerMousedown = () => {
						const control = fixture.debugElement.query(By.css('.ng-select-container'));
						control.triggerEventHandler('mousedown', event);
					};
				});

				it('should not prevent default', async () => {
					const preventDefault = vi.spyOn(event, 'preventDefault');
					triggerMousedown();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(preventDefault).not.toHaveBeenCalled();
				});
			});

			describe('clear icon click', () => {
				beforeEach(async () => {
					fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            (change)="onChange($event)"
                            bindLabel="name"
                            [multiple]="true"
                            [disabled]="disabled"
                            [readonly]="readonly"
                            [(ngModel)]="selectedCities">
                    </ng-select>`,
					);

					vi.spyOn(fixture.componentInstance, 'onChange');
					const disabled = { ...fixture.componentInstance.cities[1], disabled: true };
					fixture.componentInstance.selectedCities = <any>[fixture.componentInstance.cities[0], disabled];
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.componentInstance.cities[1].disabled = true;
					fixture.componentInstance.cities = [...fixture.componentInstance.cities];
					fixture.detectChanges();
					await fixture.whenStable();
					triggerMousedown = () => {
						const clearButton = fixture.debugElement.query(By.css('.ng-clear-wrapper'));
						clearButton.triggerEventHandler('click', createEvent({}));
					};
				});

				it('should clear model except disabled', async () => {
					triggerMousedown();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(fixture.componentInstance.selectedCities.length).toBe(1);
					expect(fixture.componentInstance.selectedCities[0]).toEqual(
						jasmine.objectContaining({
							id: 2,
							name: 'Kaunas',
						}),
					);
					expect(fixture.componentInstance.onChange).toHaveBeenCalledTimes(1);
				});

				it('should clear only search text', async () => {
					const select = fixture.componentInstance.select();
					fixture.componentInstance.selectedCities = null;
					triggerKeyDownEvent(getNgSelectElement(fixture), 'Hey! Whats up!?');

					fixture.detectChanges();
					await fixture.whenStable();
					triggerMousedown();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(fixture.componentInstance.onChange).toHaveBeenCalledTimes(0);
					expect(select.searchTerm).toBe(null);
				});

				it('should not open dropdown', async () => {
					triggerMousedown();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(fixture.componentInstance.select().isOpen()).toBe(false);
				});

				it('should respond to click events for accessibility compliance', async () => {
					// Test that mousedown alone doesn't trigger clear
					const clearButton = fixture.debugElement.query(By.css('.ng-clear-wrapper'));
					clearButton.triggerEventHandler('mousedown', createEvent({}));
					fixture.detectChanges();
					await fixture.whenStable();
					expect(fixture.componentInstance.selectedCities.length).toBe(2); // Should not have cleared

					// Test that click does trigger clear
					clearButton.triggerEventHandler('click', createEvent({}));
					fixture.detectChanges();
					await fixture.whenStable();
					expect(fixture.componentInstance.selectedCities.length).toBe(1); // Should have cleared
				});

				it('clear button should not appear if select is disabled', async () => {
					fixture.componentInstance.disabled = true;
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.detectChanges();
					await fixture.whenStable();
					const el = fixture.debugElement.query(By.css('.ng-clear-wrapper'));
					expect(el).toBeNull();
				});

				it('clear button should not appear if select is readonly', async () => {
					fixture.componentInstance.readonly = true;
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.detectChanges();
					await fixture.whenStable();
					const el = fixture.debugElement.query(By.css('.ng-clear-wrapper'));
					expect(el).toBeNull();
				});
			});

			describe('value clear icon click', () => {
				beforeEach(async () => {
					fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            [multiple]="true"
                            [(ngModel)]="selectedCities">
                    </ng-select>`,
					);
					select = fixture.componentInstance.select();

					fixture.componentInstance.selectedCities = fixture.componentInstance.cities[0];
					fixture.detectChanges();
					await fixture.whenStable();
					fixture.detectChanges();
					await fixture.whenStable();
					triggerMousedown = () => {
						const control = fixture.debugElement.query(By.css('.ng-select-container'));
						control.triggerEventHandler(
							'mousedown',
							createEvent({
								classList: { contains: (term) => term === 'ng-value-icon' },
							}),
						);
					};
				});

				it('should not open dropdown', async () => {
					triggerMousedown();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(select.isOpen()).toBe(false);
				});

				it('should focus dropdown while unselecting', async () => {
					const focus = vi.spyOn(select, 'focus');
					select.unselect(fixture.componentInstance.cities[0]);
					fixture.detectChanges();
					await fixture.whenStable();
					expect(focus).toHaveBeenCalled();
				});
			});

			describe('arrow icon click', () => {
				beforeEach(async () => {
					fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="cities"
                            bindLabel="name"
                            [(ngModel)]="selectedCity">
                    </ng-select>`,
					);

					fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
					fixture.detectChanges();
					await fixture.whenStable();
					triggerMousedown = () => {
						const control = fixture.debugElement.query(By.css('.ng-select-container'));
						control.triggerEventHandler(
							'mousedown',
							createEvent({
								classList: { contains: (term) => term === 'ng-arrow-wrapper' },
							}),
						);
					};
				});

				it('should toggle dropdown', async () => {
					// open
					triggerMousedown();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(fixture.componentInstance.select().isOpen()).toBe(true);

					// close
					triggerMousedown();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(fixture.componentInstance.select().isOpen()).toBe(false);

					// open
					triggerMousedown();
					fixture.detectChanges();
					await fixture.whenStable();
					expect(fixture.componentInstance.select().isOpen()).toBe(true);
				});
			});
		});

		describe('Append to', () => {
			it('should append dropdown to body', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`<ng-select [items]="cities"
                        appendTo="body"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				fixture.componentInstance.select().open();
				fixture.detectChanges();

				await fixture.whenStable();
				const dropdown = <HTMLElement>document.querySelector('.ng-dropdown-panel');
				expect(dropdown.parentElement).toBe(document.body);
				expect(dropdown.style.top).not.toBe('0px');
				expect(dropdown.style.left).toBe('0px');
			});

			it('should append dropdown to custom selector', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`
                <div class="container"></div>
                <ng-select [items]="cities"
                        appendTo=".container"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
				);

				fixture.componentInstance.select().open();
				fixture.detectChanges();

				await fixture.whenStable();
				const dropdown = <HTMLElement>document.querySelector('.container .ng-dropdown-panel');
				expect(dropdown.style.top).not.toBe('0px');
				expect(dropdown.style.left).toBe('0px');
			});

			it('should set correct dropdown panel horizontal position and width when appended to custom selector', async () => {
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`
                <div class="container" style="position: relative; overflow: auto; width: 200px; height: 200px">
                    <div style="height: 100%">
                        <ng-select [items]="cities"
                            appendTo=".container"
                            bindLabel="name"
                            style="width: 50%; margin-left: auto"
                            [(ngModel)]="selectedCity">
                        </ng-select>
                    </div>
                </div>`,
				);

				fixture.componentInstance.select().open();
				fixture.detectChanges();

				await fixture.whenStable();
				const dropdown = <HTMLElement>document.querySelector('.container .ng-dropdown-panel');
				expect(dropdown.style.left).toBe('100px');
				expect(dropdown.style.width).toBe('100px');
			});

			it('should apply global appendTo from NgSelectConfig', async () => {
				const config = new NgSelectConfig();
				config.appendTo = 'body';
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`
                <div class="container"></div>
                <ng-select [items]="cities"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
					config,
				);

				fixture.componentInstance.select().open();
				fixture.detectChanges();

				await fixture.whenStable();
				const dropdown = <HTMLElement>document.querySelector('.ng-dropdown-panel');
				expect(dropdown.parentElement).toBe(document.body);
				expect(dropdown.style.top).not.toBe('0px');
				expect(dropdown.style.left).toBe('0px');
			});

			it('should not apply global appendTo from NgSelectConfig if appendTo prop explicitly provided in template', async () => {
				const config = new NgSelectConfig();
				config.appendTo = 'body';
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`
                <div class="container"></div>
                <ng-select [items]="cities"
                        appendTo=".container"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
					config,
				);

				fixture.componentInstance.select().open();
				fixture.detectChanges();

				await fixture.whenStable();
				const dropdown = <HTMLElement>document.querySelector('.container .ng-dropdown-panel');
				expect(dropdown.style.top).not.toBe('0px');
				expect(dropdown.style.left).toBe('0px');
			});

			it('should pass static classes into dropdown panel when appendTo is specified', async () => {
				const config = new NgSelectConfig();
				config.appendTo = 'body';
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`
                <div class="container"></div>
                <ng-select [items]="cities"
                        class="someClass"
                        appendTo=".container"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
					config,
				);

				fixture.componentInstance.select().open();
				fixture.detectChanges();

				await fixture.whenStable();
				const dropdown = <HTMLElement>document.querySelector('.container .ng-dropdown-panel');
				expect(dropdown.classList.contains('someClass')).toBe(true);
			});

			it('should pass ngClass classes into dropdown panel when appendTo is specified', async () => {
				const config = new NgSelectConfig();
				config.appendTo = 'body';
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`
                <div class="container"></div>
                <ng-select [items]="cities"
                        [ngClass]="{ someClass: visible }"
                        appendTo=".container"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
					config,
				);

				fixture.componentInstance.visible = true;
				fixture.componentInstance.select().open();
				fixture.detectChanges();

				await fixture.whenStable();
				const dropdown = <HTMLElement>document.querySelector('.container .ng-dropdown-panel');
				expect(dropdown.classList.contains('someClass')).toBe(true);

				fixture.componentInstance.visible = false;
				fixture.detectChanges();

				expect(dropdown.classList.contains('someClass')).toBe(false);
			});
			it('should pass static classes into dropdown panel when appendTo is specified', async () => {
				const config = new NgSelectConfig();
				config.appendTo = 'body';
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`
                <div class="container"></div>
                <ng-select [items]="cities"
                        class="someClass"
                        appendTo=".container"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
					config,
				);

				fixture.componentInstance.select().open();
				fixture.detectChanges();

				await fixture.whenStable();
				const dropdown = <HTMLElement>document.querySelector('.container .ng-dropdown-panel');
				expect(dropdown.classList.contains('someClass')).toBe(true);
			});

			it('should pass ngClass classes into dropdown panel when appendTo is specified', async () => {
				const config = new NgSelectConfig();
				config.appendTo = 'body';
				const fixture = createTestingModule(
					NgSelectTestComponent,
					`
                <div class="container"></div>
                <ng-select [items]="cities"
                        [ngClass]="{ someClass: visible }"
                        appendTo=".container"
                        [(ngModel)]="selectedCity">
                </ng-select>`,
					config,
				);

				fixture.componentInstance.visible = true;
				fixture.componentInstance.select().open();
				fixture.detectChanges();

				await fixture.whenStable();
				const dropdown = <HTMLElement>document.querySelector('.container .ng-dropdown-panel');
				expect(dropdown.classList.contains('someClass')).toBe(true);

				fixture.componentInstance.visible = false;
				fixture.detectChanges();

				expect(dropdown.classList.contains('someClass')).toBe(false);
			});
			describe('Grouping', () => {
				it('should group flat items list by group key', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        [(ngModel)]="selectedAccount">
                </ng-select>`,
					);

					fixture.detectChanges();
					await fixture.whenStable();

					const items = fixture.componentInstance.select().itemsList.items;

					expect(items.length).toBe(14);
					expect(items[0].children).toBeDefined();
					expect(items[0].index).toBe(0);
					expect(items[0].label).toBe('United States');
					expect(items[0].disabled).toBeTruthy();
					expect(items[0].value).toEqual({ country: 'United States' });

					expect(items[1].children).toBeUndefined();
					expect(items[1].parent).toBe(items[0]);

					expect(items[2].children).toBeUndefined();
					expect(items[2].parent).toBe(items[0]);

					expect(items[3].label).toBe('Argentina');
					expect(items[3].label).toBe('Argentina');

					expect(items[10].label).toBe('Colombia');
					expect(items[11].parent).toBe(items[10]);
				});

				it('should group items with children array by group key', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="groupedAccounts"
                        groupBy="accounts"
                        [(ngModel)]="selectedAccount">
                </ng-select>`,
					);

					fixture.detectChanges();
					await fixture.whenStable();

					const items = fixture.componentInstance.select().itemsList.items;

					expect(items.length).toBe(14);
					expect(items[0].children).toBeDefined();
					expect(items[0].index).toBe(0);
					expect(items[0].disabled).toBeTruthy();
					expect(items[0].value).toEqual(jasmine.objectContaining({ country: 'United States' }));

					expect(items[1].children).toBeUndefined();
					expect(items[1].parent).toBe(items[0]);

					expect(items[2].children).toBeUndefined();
					expect(items[2].parent).toBe(items[0]);

					expect(items[3].value).toEqual(jasmine.objectContaining({ country: 'Argentina' }));

					expect(items[10].value).toEqual(jasmine.objectContaining({ country: 'Colombia' }));
					expect(items[11].parent).toBe(items[10]);
				});

				it('should not group items without key', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="accounts"
                        groupBy="country"
                        [(ngModel)]="selectedAccount">
                </ng-select>`,
					);

					fixture.detectChanges();
					await fixture.whenStable();

					fixture.componentInstance.accounts.push(
						<any>{
							name: 'Henry',
							email: 'henry@email.com',
							age: 10,
						},
						<any>{ name: 'Meg', email: 'meg@email.com', age: 7, country: null },
						<any>{
							name: 'Meg',
							email: 'meg@email.com',
							age: 7,
							country: '',
						},
					);
					fixture.componentInstance.accounts = [...fixture.componentInstance.accounts];
					fixture.detectChanges();
					await fixture.whenStable();

					const items: NgOption[] = fixture.componentInstance.select().itemsList.items;
					expect(items.length).toBe(18);
					expect(items[0].children).toBeTruthy();
					expect(items[0].parent).toBeNull();
					expect(items[14].children).toBeUndefined();
					expect(items[14].parent).toBeUndefined();
					expect(items[15].children).toBeUndefined();
					expect(items[15].parent).toBeUndefined();
					expect(items[16].children).toBeTruthy();
					expect(items[16].label).toBe('');
					expect(items[17].parent).toBeDefined();
				});

				it('should group by group fn', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="accounts"
                        bindLabel="name"
                        [groupBy]="groupByFn"
                        [(ngModel)]="selectedAccount">
                </ng-select>`,
					);

					fixture.detectChanges();
					await fixture.whenStable();

					const items = fixture.componentInstance.select().itemsList.items;

					expect(items.length).toBe(12);
					expect(items[0].children).toBeDefined();
					expect(items[0].value.name).toBe('c1');
					expect(items[6].children).toBeDefined();
					expect(items[6].value.name).toBe('c2');
				});

				it('should set group value using custom fn', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="accounts"
                        bindLabel="name"
                        [groupBy]="groupByFn"
                        [groupValue]="groupValueFn"
                        [(ngModel)]="selectedAccount">
                </ng-select>`,
					);

					fixture.detectChanges();
					await fixture.whenStable();

					const items = fixture.componentInstance.select().itemsList.items;

					expect(items.length).toBe(12);
					expect(items[0].children).toBeDefined();
					expect(items[0].value.group).toBe('c1');
					expect(items[6].children).toBeDefined();
					expect(items[6].value.group).toBe('c2');
				});

				it('should not mark optgroup item as marked', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="accounts"
                        groupBy="country"
                        bindValue="name"
                        [(ngModel)]="selectedAccountName">
                </ng-select>`,
					);

					fixture.detectChanges();
					await fixture.whenStable();

					const select = fixture.componentInstance.select();
					expect(select.itemsList.markedItem).toBeUndefined();

					select.onItemHover(select.itemsList.items[0]);
					expect(select.itemsList.markedItem).toBeUndefined();
				});

				it('should filter grouped items', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        [(ngModel)]="selectedAccount">
                </ng-select>`,
					);

					fixture.detectChanges();
					await fixture.whenStable();
					const select = fixture.componentInstance.select();
					select.filter('aDaM');

					const filteredItems = select.itemsList.filteredItems;
					expect(filteredItems.length).toBe(2);
					expect(filteredItems[0].children).toBeTruthy();
					expect(filteredItems[1].parent).toBe(filteredItems[0]);

					select.filter('not in list');
					expect(select.itemsList.filteredItems.length).toBe(0);
				});

				it('should allow select optgroup items when [selectableGroup]="true"', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        bindValue="email"
                        [selectableGroup]="true"
                        [(ngModel)]="selectedAccount">
                </ng-select>`,
					);

					fixture.detectChanges();
					await fixture.whenStable();
					await selectOption(fixture, KeyCode.ArrowDown, 0);
					expect(fixture.componentInstance.selectedAccount).toBe('United States');

					await selectOption(fixture, KeyCode.ArrowDown, 1);
					expect(fixture.componentInstance.selectedAccount).toBe('adam@email.com');
				});

				it('should select group by default when [selectableGroup]="true"', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        bindValue="email"
                        [selectableGroup]="true"
                        [(ngModel)]="selectedAccount">
                </ng-select>`,
					);

					const select = fixture.componentInstance.select();
					fixture.detectChanges();
					await fixture.whenStable();
					select.filter('adam');
					await new Promise(resolve => setTimeout(resolve, 200));

					await selectOption(fixture, KeyCode.ArrowDown, 0);
					expect(fixture.componentInstance.selectedAccount).toBe('United States');
				});
				it('Should have class ng-select', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        bindValue="email"
                        [(ngModel)]="selectedAccount">
                </ng-select>`,
					);

					fixture.detectChanges();
					const element = fixture.elementRef.nativeElement;
					const elClasses: DOMTokenList = element.children[0].classList;
					const hasClass = elClasses.contains('ng-select');

					expect(hasClass).toBe(true);
				});
				it('Should have class ng-select and test', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        bindValue="email"
                        [(ngModel)]="selectedAccount"
                        [class]="'test'">
                </ng-select>`,
					);

					fixture.detectChanges();
					const element = fixture.elementRef.nativeElement;
					const elClasses: DOMTokenList = element.children[0].classList;
					const hasClass = elClasses.contains('ng-select') && elClasses.contains('test');

					expect(hasClass).toBe(true);
				});

				it('should correctly update ng option selected property when groups map has undefined key', async () => {
					const fixture = createTestingModule(
						NgSelectGroupingTestComponent,
						`<ng-select [items]="accounts"
                        groupBy="group"
                        bindLabel="name"
                        bindValue="email"
                        [(ngModel)]="selectedAccount"
                        [class]="'test'">
                </ng-select>`,
					);

					const select = fixture.componentInstance.select();
					const nativeElement: HTMLElement = fixture.nativeElement as HTMLElement;

					select.filter('Adam');
					await selectOption(fixture, KeyCode.ArrowDown, 0);
					expect(fixture.componentInstance.selectedAccount).toBe('adam@email.com');

					select.filter('Amalie');
					await selectOption(fixture, KeyCode.ArrowDown, 0);
					expect(fixture.componentInstance.selectedAccount).toBe('amalie@email.com');

					select.filter('A');
					expect(nativeElement.querySelectorAll('.ng-option-selected').length).toBe(1, 2);
					expect(select.viewPortItems.filter((opt) => opt.selected).length).toBe(1, 2);
					expect(select.viewPortItems.find((opt) => opt.selected).index).toBe(2, 0);
					expect(select.itemsList.selectedItems.length).toBe(1);
				});
			});

			describe('Input method composition', () => {
				let fixture: ComponentFixture<NgSelectTestComponent>;
				let select: NgSelectComponent;
				const originValue = '';
				const imeInputValue = 'zhangsan';

				beforeEach(() => {
					fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [items]="citiesNames"
					[keyDownFn]="keyDownFn"
                    [addTag]="true"
                    placeholder="select value"
                    [searchWhileComposing]="searchWhileComposing"
                    [(ngModel)]="selectedCity">
                </ng-select>`,
					);
					select = fixture.componentInstance.select();
					fixture.componentInstance.searchWhileComposing = false;
				});

				describe('composition start', () => {
					it('should not update search term', async () => {
						select.filter(originValue);
						fixture.detectChanges();
						await fixture.whenStable();
						select.onCompositionStart();
						fixture.detectChanges();
						await fixture.whenStable();
						select.filter(imeInputValue);

						expect(select.searchTerm).toBe(originValue);
					});

					it('should be filtered even search term is empty', async () => {
						select.filter('');
						fixture.detectChanges();
						await fixture.whenStable();
						select.onCompositionStart();
						fixture.detectChanges();
						await fixture.whenStable();
						select.filter(imeInputValue);

						expect(select.searchTerm).toBe('');
						expect(select.filtered).toBeTruthy();
					});
				});

				describe('composition end', () => {
					it('should update search term', async () => {
						fixture.detectChanges();
						await fixture.whenStable();
						select.filter(originValue);
						fixture.detectChanges();
						await fixture.whenStable();
						select.onCompositionEnd(imeInputValue);
						fixture.detectChanges();
						await fixture.whenStable();

						expect(select.searchTerm).toBe(imeInputValue);
					});

					it('should update search term when searchWhileComposing', async () => {
						fixture.componentInstance.searchWhileComposing = true;
						select.onCompositionStart();
						select.onCompositionEnd(imeInputValue);
						select.filter('new term');

						expect(select.searchTerm).toBe('new term');
					});
				});
			});

			describe('User defined keyDown handler', () => {
				let fixture: ComponentFixture<NgSelectTestComponent>;
				let select: NgSelectComponent;

				beforeEach(() => {
					fixture = createTestingModule(
						NgSelectTestComponent,
						`<ng-select [keyDownFn]="keyDownFn" />`);
					select = fixture.componentInstance.select();
				});

				const expectSpyToBeCalledAfterKeyDown = (spy, expectedNumber) => {
					const possibleKeyCodes = Object.keys(KeyCode);
					possibleKeyCodes.forEach((keyCode) => {
						triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode[keyCode]);
					});
					expect(spy).toHaveBeenCalledTimes(expectedNumber);
				};

				it('should execute user function if any of defined keys was pressed', () => {
					const spy = vi.spyOn(fixture.componentInstance.select().keyDownFn[SIGNAL], 'value');

					expectSpyToBeCalledAfterKeyDown(spy, Object.keys(KeyCode).length);
				});

				it('should not call any of default keyDown handlers if user handler returns false', async () => {
					fixture.componentInstance.keyDownFn = () => false;
					fixture.detectChanges();
					await fixture.whenStable();
					const spy = vi.spyOn(fixture.componentInstance.select(), 'handleKeyCode');

					expectSpyToBeCalledAfterKeyDown(spy, 0);
				});

				it('should call default keyHandler if user handler returns truthy', async () => {
					fixture.componentInstance.keyDownFn = () => true;
					fixture.detectChanges();
					await fixture.whenStable();

					const spy = vi.spyOn(fixture.componentInstance.select(), 'handleKeyCode');
					expectSpyToBeCalledAfterKeyDown(spy, Object.keys(KeyCode).length);
				});

				it('should call default keyHandler if user handler returns falsy but not `false`', async () => {
					fixture.componentInstance.keyDownFn = () => null;
					fixture.detectChanges();
					await fixture.whenStable();

					const spy = vi.spyOn(fixture.componentInstance.select(), 'handleKeyCode');
					expectSpyToBeCalledAfterKeyDown(spy, Object.keys(KeyCode).length);
				});
			});

		});
	});
});

function createTestingModule<T>(cmp: Type<T>, template: string, customNgSelectConfig: NgSelectConfig | null = null): ComponentFixture<T> {
	TestBed.resetTestingModule();
	TestBed.configureTestingModule({
		imports: [FormsModule, NgSelectModule],
		providers: [
			{ provide: ErrorHandler, useClass: TestsErrorHandler },
			{
				provide: NgZone,
				useFactory: () => new MockNgZone(),
			},
			{ provide: ConsoleService, useFactory: () => new MockConsole() },
		],
	}).overrideComponent(cmp, {
		set: {
			template,
		},
	});

	if (customNgSelectConfig) {
		TestBed.overrideProvider(NgSelectConfig, { useValue: customNgSelectConfig });
	}

	TestBed.compileComponents();

	const fixture = TestBed.createComponent(cmp);
	fixture.detectChanges();
	return fixture;
}

function createEvent(target = {}) {
	return {
		preventDefault: () => { },
		target: {
			className: '',
			tagName: '',
			classList: {
				contains: () => { },
			},
			...target,
		},
	};
}

@Component({
	template: ``,
	standalone: true,
	imports: [NgSelectModule, FormsModule],
})
class NgSelectTestComponent {
	readonly select = viewChild(NgSelectComponent);
	multiple = false;
	label = 'Yes';
	clearOnBackspace = true;
	disabled = false;
	readonly = false;
	dropdownPosition = 'bottom';
	visible = true;
	minTermLength = 0;
	filter = new Subject<string>();
	searchFn: (term: string, item: any) => boolean = null;
	selectOnTab = true;
	tabFocusOnClearButton: boolean;
	hideSelected = false;
	closeOnSelect = true;
	clearable = true;
	markFirst = true;
	searchable = true;
	openOnEnter = undefined;
	maxSelectedItems = undefined;
	addTag: boolean | AddTagFn = false;
	typeahead = undefined;
	preventToggleOnRightClick = false;
	searchWhileComposing = true;

	citiesLoading = false;
	selectedCityId: number;
	selectedCityIds: number[];
	selectedCity: { id: number; name: string };
	selectedCities: { id: number; name: string }[];
	city: { id: number; name: string };
	cityValue: any;
	cities: any[] = [
		{ id: 1, name: 'Vilnius' },
		{ id: 2, name: 'Kaunas' },
		{ id: 3, name: 'Pabrade' },
	];
	readonlyCities: readonly any[] = [
		{ id: 1, name: 'Vilnius' },
		{ id: 2, name: 'Kaunas' },
		{
			id: 3,
			name: 'Pabrade',
		},
	] as const;
	citiesNames = this.cities.map((x) => x.name);

	selectedCountry: any;
	itemsWithNestedBindValue: any[] = [];
	nestedSelectedItem: any;
	countries = [
		{ id: 1, description: { name: 'Lithuania', id: 'a' } },
		{
			id: 2,
			description: { name: 'USA', id: 'b' },
		},
		{ id: 3, description: { name: 'Australia', id: 'c' } },
	];
	keyDownFn = () => { };

	tagFunc(term: string) {
		return { id: term, name: term, custom: true };
	}

	tagFuncPromise(term: string) {
		return Promise.resolve({
			id: 5,
			name: term,
			valid: true,
		});
	}

	compareWith(a, b) {
		return a.name === b.name && a.district === b.district;
	}

	toggleVisible() {
		this.visible = !this.visible;
	}

	onChange(_: any) { }

	onFocus(_: Event) { }

	onBlur(_: Event) { }

	onOpen() { }

	onClose() { }

	onAdd(_: Event) { }

	onRemove(_: Event) { }

	onClear() { }

	onSearch(_: any) { }

	onScroll() { }

	onScrollToEnd() { }
}

@Component({
	template: ``,
	encapsulation: ViewEncapsulation.ShadowDom,
	imports: [NgSelectModule, FormsModule],
})
class EncapsulatedTestComponent extends NgSelectTestComponent {
	readonly select = viewChild(NgSelectComponent);
}

@Component({
	template: ``,
	imports: [NgSelectModule, FormsModule],
})
class NgSelectGroupingTestComponent {
	readonly select = viewChild(NgSelectComponent);
	selectedAccountName = 'Adam';
	selectedAccount = null;
	accounts = [
		{
			name: 'Adam',
			email: 'adam@email.com',
			age: 12,
			country: 'United States',
			child: { name: 'c1' },
		},
		{
			name: 'Samantha',
			email: 'samantha@email.com',
			age: 30,
			country: 'United States',
			child: { name: 'c1' },
		},
		{
			name: 'Amalie',
			email: 'amalie@email.com',
			age: 12,
			country: 'Argentina',
			child: { name: 'c1' },
		},
		{
			name: 'Estefanía',
			email: 'estefania@email.com',
			age: 21,
			country: 'Argentina',
			child: { name: 'c1' },
		},
		{
			name: 'Adrian',
			email: 'adrian@email.com',
			age: 21,
			country: 'Ecuador',
			child: { name: 'c1' },
		},
		{
			name: 'Wladimir',
			email: 'wladimir@email.com',
			age: 30,
			country: 'Ecuador',
			child: { name: 'c2' },
		},
		{
			name: 'Natasha',
			email: 'natasha@email.com',
			age: 54,
			country: 'Ecuador',
			child: { name: 'c2' },
		},
		{
			name: 'Nicole',
			email: 'nicole@email.com',
			age: 43,
			country: 'Colombia',
			child: { name: 'c2' },
		},
		{
			name: 'Michael',
			email: 'michael@email.com',
			age: 15,
			country: 'Colombia',
			child: { name: 'c2' },
		},
		{ name: 'Nicolás', email: 'nicole@email.com', age: 43, country: 'Colombia', child: { name: 'c2' } },
	];
	groupedAccounts = [
		{
			country: 'United States',
			accounts: [
				{ name: 'Adam', email: 'adam@email.com', age: 12 },
				{
					name: 'Samantha',
					email: 'samantha@email.com',
					age: 30,
				},
			],
		},
		{
			country: 'Argentina',
			accounts: [
				{ name: 'Amalie', email: 'amalie@email.com', age: 12 },
				{
					name: 'Estefanía',
					email: 'estefania@email.com',
					age: 21,
				},
			],
		},
		{
			country: 'Ecuador',
			accounts: [
				{ name: 'Adrian', email: 'adrian@email.com', age: 21 },
				{
					name: 'Wladimir',
					email: 'wladimir@email.com',
					age: 30,
				},
				{ name: 'Natasha', email: 'natasha@email.com', age: 54 },
			],
		},
		{
			country: 'Colombia',
			accounts: [
				{ name: 'Nicole', email: 'nicole@email.com', age: 43 },
				{
					name: 'Michael',
					email: 'michael@email.com',
					age: 15,
				},
				{ name: 'Nicolás', email: 'nicole@email.com', age: 43 },
			],
		},
	];

	groupByFn = (item) => item.child.name;

	groupValueFn = (key, _) => ({ group: key });
}

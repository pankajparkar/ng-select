import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { JsonPipe } from '@angular/common';

@Component({
	selector: 'ng-data-source-options-example',
	templateUrl: './data-source-options-example.component.html',
	styleUrls: ['./data-source-options-example.component.scss'],
	imports: [NgSelectComponent, FormsModule, NgOptionComponent, JsonPipe],
})
export class DataSourceOptionsExampleComponent {
	selectedCars = [3];
	fakeModel: string = '';

	testFakeVal = '';

	constructor() {
		setTimeout(() => {
			this.testFakeVal = 'worked';
		}, 5000);
	}
	disabled = false;
	// cars = [
	// 	{ id: 1, name: 'Volvo' },
	// 	{ id: 3, name: 'Pabrade' },
	// ];
	// ngOnInit() {
	// 	setTimeout(() => {
	// 		this.cars = [
	// 			{ id: 1, name: 'Volvo' },
	// 			{ id: 3, name: 'Pabrade' },
	// 			{ id: 5, name: 'Audi 1' },
	// 		];
	// 	}, 5000);

	// 	setTimeout(() => {
	// 		this.disabled = true;
	// 	}, 6000);
	// }

	// selectedCity = { name: 'Vilnius', id: 1 };
	// cities: any[] = [
	// 	{ id: 1, name: 'Vilnius' },
	// 	{ id: 2, name: 'Kaunas' },
	// 	{ id: 3, name: 'Pabrade' },
	// ];

	toggleDisabled() {
		// const car: any = this.cars[1];
		// car.disabled = !car.disabled;
	}
}

import {
	afterEveryRender,
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	inject,
	input,
	signal,
} from '@angular/core';

@Component({
	selector: 'ng-option',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<ng-content />`,
})
export class NgOptionComponent {
	public readonly value = input<any>();
	public readonly disabled = input(false, {
		transform: booleanAttribute,
	});
	public readonly elementRef = inject(ElementRef<HTMLElement>);

	/**
	 * Signal that tracks the current label from innerHTML.
	 * Updates after every render to capture async content changes.
	 */
	public readonly label = signal<string>('');

	constructor() {
		afterEveryRender(() => {
			const currentLabel = (this.elementRef.nativeElement.innerHTML || '').trim();
			if (currentLabel !== this.label()) {
				this.label.set(currentLabel);
			}
		});
	}
}

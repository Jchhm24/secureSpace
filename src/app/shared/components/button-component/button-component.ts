import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button-component',
  imports: [],
  templateUrl: './button-component.html',
  styleUrl: './button-component.css',
  host: {
    '[style.--width]': 'width',
  },
})
export class ButtonComponent {
  label = input.required<string>();
  ariaLabel = input.required<string>();
  clickAction = output<void>();

  width = 'auto';
  textAlign = 'start';

  onClick(): void {
    this.clickAction.emit();
  }
}

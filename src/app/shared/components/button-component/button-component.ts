import { NgClass } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-button-component',
  imports: [NgClass],
  templateUrl: './button-component.html',
  styleUrl: './button-component.css',
  host: {
    '[style.--width]': 'width',
    '[style.--scale-hover]': 'scaleHover',
  },
})
export class ButtonComponent {
  label = input.required<string>();
  ariaLabel = input.required<string>();
  clickAction = output<void>();
  enabled = input<boolean>(true);
  enabledLabel = input<string>('text of the button when it is enabled');

  width = 'auto';
  textAlign = 'start';
  scaleHover = '1.05';

  onClick(): void {
    this.clickAction.emit();
  }
}

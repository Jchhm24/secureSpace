import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button-component',
  imports: [],
  templateUrl: './button-component.html',
  styleUrl: './button-component.css',
  host: {
    '[style.--width]' : 'width',
  }
})
export class ButtonComponent {
  label = input.required<string>();
  ariaLabel = input.required<string>();

  width = 'auto';
  textAlign = 'start';
}

import { Component, input } from '@angular/core';
import { InputType } from './input-types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-component',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './input-component.html',
  styleUrl: './input-component.css',
  host: {
    '[style.--width]' : 'width',
  }
})
export class InputComponent {
  type = input.required<InputType>();
  placeholder = input.required<string>();
  name = input.required<string>();
  id = input<string>();
  control = input.required<FormControl<string | number | null>>();
  required = input<boolean>(false);

  width = 'auto';

  get showError():boolean{
    const ctrl = this.control();
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}

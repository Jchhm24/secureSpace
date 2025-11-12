import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-switch-input',
  imports: [ReactiveFormsModule],
  templateUrl: './switch-input.html',
  styleUrl: './switch-input.css'
})
export class SwitchInput {
  label = input('Etiqueta');
  control = input.required<FormControl<boolean>>();
}

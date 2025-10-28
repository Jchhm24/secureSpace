import { Component, input } from '@angular/core';

@Component({
  selector: 'app-label-indicator',
  imports: [],
  templateUrl: './label-indicator.html',
  styleUrl: './label-indicator.css'
})
export class LabelIndicator {
  label =  input.required<string>();
}

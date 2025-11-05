import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { useToggle } from '@shared/hooks/use-toggle';
import { selectInputCustom } from './select-input-custom-input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ClickOutside } from '@shared/directives/click-outside';
import { LucideAngularModule } from 'lucide-angular';
import { IconService } from '@core/services/icon-service';

@Component({
  selector: 'app-select-input-custom',
  imports: [ReactiveFormsModule, NgClass, ClickOutside, LucideAngularModule],
  templateUrl: './select-input-custom.html',
  styleUrl: './select-input-custom.css',
  host: {
    '[style.--width]': 'width',
  },
})
export class SelectInputCustom {
  options = input.required<selectInputCustom[]>();
  label = input('Seleccione una opción');
  control = input.required<FormControl<string | null>>();

  protected width = 'auto';
  protected opened = useToggle();
  protected icons = inject(IconService).icons;

  protected defaultOption = computed<selectInputCustom>(() => ({
    key: '',
    label: this.label(),
  }));

  // Create a signal to hold the control value
  private controlValue = signal<string | null>(null);

  constructor() {
    effect(() => {
      const ctrl = this.control();
      this.controlValue.set(ctrl.value);

      ctrl.valueChanges.subscribe((value) => {
        this.controlValue.set(value);
      });
    });
  }
  protected optionsSelect = computed<selectInputCustom[]>(() => {
    return [this.defaultOption(), ...this.options()];
  });

  protected selectedOption = computed<selectInputCustom>(() => {
    const value = this.controlValue();
    return (
      this.optionsSelect().find((option) => option.key === value) ||
      this.defaultOption()
    );
  });

  changeOptionSelected(option: selectInputCustom) {
    this.control().setValue(option.key);
    this.opened.close();
  }

  get showError(): boolean {
    const ctrl = this.control();
    const selected = this.selectedOption();

    return (ctrl.touched || ctrl.dirty) && ctrl.invalid && selected.key === '';
  }
}

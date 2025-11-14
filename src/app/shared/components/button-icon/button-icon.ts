import { NgClass } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { IconService } from '@core/services/icon-service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-button-icon',
  imports: [LucideAngularModule, NgClass],
  templateUrl: './button-icon.html',
  styleUrl: './button-icon.css',
})
export class ButtonIcon {
  type_button = input.required<
    | 'add_user'
    | 'history'
    | 'qr_code'
    | 'edit'
    | 'delete'
    | 'close'
    | 'lock'
    | 'unlock'
    | 'options-points'
  >();
  title_button = input.required<string>();
  clickAction = output<void>();
  protected icons = inject(IconService).icons;

  onClick(): void {
    this.clickAction.emit();
  }
}

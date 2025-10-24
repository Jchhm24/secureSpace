import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { IconService } from '@core/services/icon-service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-button-icon',
  imports: [LucideAngularModule, NgClass],
  templateUrl: './button-icon.html',
  styleUrl: './button-icon.css'
})
export class ButtonIcon {

  type_button = input.required<
    'add_user' | 'history' | 'qr_code' | 'edit' | 'delete'
  >();
  function_action = input.required<() => void>();
  title_button = input.required<string>();

  icons = inject(IconService).icons;
}

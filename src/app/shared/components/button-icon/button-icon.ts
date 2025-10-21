import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { History, LucideAngularModule, QrCode, SquarePen, Trash2, UserRoundPlus } from 'lucide-angular';

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

  icons = {
    personAdd: UserRoundPlus,
    history: History,
    qrCode: QrCode,
    edit: SquarePen,
    trash: Trash2,
  }
}

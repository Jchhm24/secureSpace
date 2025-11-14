import { Component, input } from '@angular/core';
import { ButtonIcon } from '../button-icon/button-icon';
import { useToggle } from '@shared/hooks/use-toggle';
import { ButtonActionCompact } from '@shared/interfaces/button-action-compact-interface';

@Component({
  selector: 'app-button-actions-compact',
  imports: [ButtonIcon],
  templateUrl: './button-actions-compact.html',
  styleUrl: './button-actions-compact.css',
})
export class ButtonActionsCompact {
  buttons = input.required<ButtonActionCompact[]>();
  itemId = input.required<string>();

  protected open = useToggle();

  onButtonClick(action: (id?: string) => void): void {
    action(this.itemId());
    this.open.close();
  }
}

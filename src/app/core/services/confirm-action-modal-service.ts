import { Injectable, signal } from '@angular/core';
import { ConfirmActionModalConfig } from '@shared/interfaces/confirm-action-modal-interface';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfirmActionModalService {

  private config = signal<ConfirmActionModalConfig>({
    title: 'title here',
    message: 'message here',
    iconType: 'info',
    buttonText: 'Accept',
    isOpen: false,
  });

  readonly modalConfig = this.config.asReadonly();

  private buttonClick = new Subject<void>();
  readonly onButtonClick$ = this.buttonClick.asObservable();

  notifyButtonClick() {
    this.buttonClick.next();
  }

  setConfig(config: Partial<ConfirmActionModalConfig>) {
    this.config.update((current) => ({ ...current, ...config }));
  }

  openModal() {
    this.config.update((current) => ({ ...current, isOpen: true }));
  }

  closeModal() {
    this.config.update((current) => ({ ...current, isOpen: false }));
  }
}

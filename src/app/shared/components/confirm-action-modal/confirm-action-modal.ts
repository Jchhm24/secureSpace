import { Component, inject } from '@angular/core';
import { ConfirmActionModalService } from '@core/services/confirm-action-modal-service';
import { IconService } from '@core/services/icon-service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-confirm-action-modal',
  imports: [LucideAngularModule],
  templateUrl: './confirm-action-modal.html',
  styleUrl: './confirm-action-modal.css'
})
export class ConfirmActionModal {
  protected icons = inject(IconService).icons;
  private modalService = inject(ConfirmActionModalService);
  protected modalConfig = this.modalService.modalConfig;

  onActionClick(){
    this.modalService.notifyButtonClick();
  }

  onCancelClick(){
    this.modalService.closeModal();
  }

}

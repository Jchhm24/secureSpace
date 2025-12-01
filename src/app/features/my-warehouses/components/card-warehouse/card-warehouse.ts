import { Component, inject, input, model, output } from '@angular/core';
import { IconService } from '@core/services/icon-service';
import { ToastService } from '@core/services/toast-service';
import { UserWarehousesService } from '@core/services/user-warehouses-service';
import { Warehouse } from '@features/warehouses/interfaces';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-card-warehouse',
  imports: [LucideAngularModule, ButtonComponent, RouterLink],
  templateUrl: './card-warehouse.html',
  styleUrl: './card-warehouse.css',
})
export class CardWarehouse {
  warehouse = input<Warehouse>();
  openQrCodeModal = output<void>();

  protected readonly icons = inject(IconService).icons;
  protected userWarehousesService = inject(UserWarehousesService);
  protected toastService = inject(ToastService);

  openWarehouse() {
    this.userWarehousesService
      .openWarehouse(this.warehouse()?.id || '')
      .subscribe((response: { success: boolean; message: string }) => {
        if (response.success) {
          this.toastService.show(response.message, 'success');
        } else {
          this.toastService.show(response.message, 'error');
        }
      });
  }

  openQrCode() {
    this.openQrCodeModal.emit();
  }
}

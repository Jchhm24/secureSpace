import { Component, inject, input, model, output } from '@angular/core';
import { IconService } from '@core/services/icon-service';
import { Warehouse } from '@features/warehouses/interfaces';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-card-warehouse',
  imports: [LucideAngularModule, ButtonComponent],
  templateUrl: './card-warehouse.html',
  styleUrl: './card-warehouse.css',
})
export class CardWarehouse {
  warehouse = input<Warehouse>();
  openQrCodeModal = output<void>();

  protected readonly icons = inject(IconService).icons;

  openWarehouse() {
    alert(`Abriendo bodega: ${this.warehouse()?.id}`);
  }

  openQrCode() {
    this.openQrCodeModal.emit();
  }
}

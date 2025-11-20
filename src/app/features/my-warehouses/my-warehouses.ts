import { Component, inject, OnInit, signal } from '@angular/core';
import { LayoutService } from '@core/services/layout-service';
import { UserWarehousesService } from '@core/services/user-warehouses-service';
import { WarehouseCard } from '@shared/components/warehouse-card/warehouse-card';
import { CardWarehouse } from './components/card-warehouse/card-warehouse';
import { QrGenerate } from '@shared/components/qr-generate/qr-generate';
import { useToggle } from '@shared/hooks/use-toggle';

@Component({
  selector: 'app-my-warehouses',
  imports: [WarehouseCard, CardWarehouse, QrGenerate],
  templateUrl: './my-warehouses.html',
  styleUrl: './my-warehouses.css'
})
export class MyWarehouses implements OnInit {
  private layoutService = inject(LayoutService);
  private warehouseService = inject(UserWarehousesService);

  protected totalWarehouses = this.warehouseService.totalWarehouses;
  protected warehouses = this.warehouseService.warehouses;

  protected openQrModal = useToggle();
  protected idWarehouseSelected = signal<string | null>(null);

  ngOnInit(): void {
    this.layoutService.setConfig({
      title: 'Mis Bodegas',
      showAction: false,
    })
  }

  openQrCodeModal(id: string){
    this.idWarehouseSelected.set(id);
    this.openQrModal.open();
  }
}

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '@core/services/layout-service';
import { WarehouseCard } from '@shared/components/warehouse-card/warehouse-card';
import { WarehousesTable } from './components/warehouses-table/warehouses-table';
import { WarehouseService } from '@core/services/warehouse-service';
import { Subscription } from 'rxjs';
import { useToggle } from '@shared/hooks/use-toggle';
import { CreateWarehouseModal } from './components/create-warehouse-modal/create-warehouse-modal';
import { AlertNetwork } from '@shared/components/alert-network/alert-network';

@Component({
  selector: 'app-warehouses',
  imports: [WarehouseCard, WarehousesTable, CreateWarehouseModal, AlertNetwork],
  templateUrl: './warehouses.html',
  styleUrl: './warehouses.css',
})
export class Warehouses implements OnInit, OnDestroy {
  private layoutService = inject(LayoutService);
  protected readonly warehouseService = inject(WarehouseService);
  protected totalWarehouses = this.warehouseService.totalWarehouses;
  private clickSub?: Subscription;
  protected modal = useToggle();

  ngOnInit(): void {
    this.layoutService.setConfig({
      title: 'Bodegas',
      showAction: true,
      button: {
        label: 'Crear Bodega',
        ariaLabel: 'Crear Bodega',
      },
    });

    this.clickSub = this.layoutService.onButtonClick$.subscribe(() => {
      this.modal.open();
    });
  }

  ngOnDestroy(): void {
    this.clickSub?.unsubscribe();
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { LayoutService } from '@core/services/layout-service';
import { WarehouseCard } from '@shared/components/warehouse-card/warehouse-card';
import { WarehousesTable } from './components/warehouses-table/warehouses-table';
import { WarehouseService } from '@core/services/warehouse-service';

@Component({
  selector: 'app-warehouses',
  imports: [WarehouseCard, WarehousesTable],
  templateUrl: './warehouses.html',
  styleUrl: './warehouses.css',
})
export class Warehouses implements OnInit {
  private layoutService = inject(LayoutService);
  protected readonly warehouseService = inject(WarehouseService);
  protected totalWarehouses = this.warehouseService.totalWarehouses

  ngOnInit(): void {
    this.layoutService.setConfig({
      title: 'Bodegas',
      showAction: true,
      button: {
        label: 'Crear Bodega',
        ariaLabel: 'Crear Bodega',
        functionAction: () => {
          alert('Boton para crear bodega');
        },
      },
    });
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { LayoutService } from '@core/services/layout-service';
import { WarehouseCard } from '@shared/components/warehouse-card/warehouse-card';
import { WarehousesTable } from './components/warehouses-table/warehouses-table';

@Component({
  selector: 'app-warehouses',
  imports: [WarehouseCard, WarehousesTable],
  templateUrl: './warehouses.html',
  styleUrl: './warehouses.css',
})
export class Warehouses implements OnInit {
  private layoutService = inject(LayoutService);

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

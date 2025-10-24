import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputComponent } from '@shared/components/input-component/input-component';
import { LucideAngularModule } from 'lucide-angular';
import { BadgeEnable } from '../badge-enable/badge-enable';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { WarehouseService } from '@core/services/warehouse-service';
import { Warehouse } from '@features/warehouses/interfaces/warehouse-interface';
import { paginateTable } from '@shared/utils/helpers/paginateTable';
import { NgClass } from '@angular/common';
import { IconService } from '@core/services/icon-service';

@Component({
  selector: 'app-warehouses-table',
  imports: [
    LucideAngularModule,
    InputComponent,
    BadgeEnable,
    ButtonIcon,
    NgClass,
  ],
  templateUrl: './warehouses-table.html',
  styleUrl: './warehouses-table.css',
})
export class WarehousesTable implements OnInit {
  private readonly ITEMS_PER_PAGE = 5;

  icons = inject(IconService).icons;

  searchControl = new FormControl('');
  warehouseService = inject(WarehouseService);
  warehouses = signal<Warehouse[]>([]);
  groupedWarehouses = signal<Warehouse[][]>([]);
  index_page = signal(0);

  ngOnInit(): void {
    this.getPaginatedData(
      this.ITEMS_PER_PAGE,
      this.warehouseService.getFormattedWarehouses(),
    );
  }

  getPaginatedData(limit: number, data: Warehouse[] | undefined): void {
    const tableIndications = paginateTable(limit, data);
    this.groupedWarehouses.set(tableIndications.groupedData);
    this.warehouses.set(tableIndications.paginatedData);
  }

  changePage(page: number): void {
    this.index_page.set(page);
    this.warehouses.set(this.groupedWarehouses()[page] || []);
  }

  functionButton() {
    alert('solo para representar el boton');
  }
}

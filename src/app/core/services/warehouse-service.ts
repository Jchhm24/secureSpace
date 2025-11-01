import { Injectable, signal } from '@angular/core';
import { warehouses } from '@features/warehouses/const/warehouses-data';
import { Warehouse } from '@features/warehouses/interfaces/warehouse-interface';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  state = signal({
    warehouses: new Map<string, Warehouse>(),
  });

  constructor() {
    this.getWarehouses();
  }

  getWarehouses() {
    const mockWarehouses: Warehouse[] = warehouses;

    of(mockWarehouses).subscribe((result) => {
      result.forEach((warehouse) => {
        this.state().warehouses.set(warehouse.id, warehouse);
      });

      this.state.set({ warehouses: this.state().warehouses });
    });
  }

  getFormattedWarehouses() {
    return Array.from(this.state().warehouses.values());
  }
}

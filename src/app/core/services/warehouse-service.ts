import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environment/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { UserService } from './user-service';
import {
  WarehouseCreateInterface,
  Warehouse,
  WarehouseHomeData,
} from '@features/warehouses/interfaces';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  state = signal({
    warehouses: new Map<string, Warehouse>(),
  });

  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;
  private user = inject(UserService);

  private _totalWarehouses = signal<{
    total: number;
    available: number;
    occupied: number;
  }>({
    total: 0,
    available: 0,
    occupied: 0,
  });

  readonly totalWarehouses = this._totalWarehouses.asReadonly();

  constructor() {
    this.getWarehousesData();
  }

  getWarehousesData() {
    const token = this.user.getToken();
    this.http
      .get<any>(`${this.apiUrl}/bodegasHome`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching total warehouses count:', error);
          return of(null);
        }),
      )
      .subscribe((response: WarehouseHomeData) => {
        const { info, data } = response;
        // cards total warehouses
        this._totalWarehouses.set({
          total: info.total || 0,
          available: info.libres || 0,
          occupied: info.ocupadas || 0,
        });
        // table warehouses dat
        of(data).subscribe((result) => {
          result.forEach((warehouses) => {
            this.state().warehouses.set(warehouses.id, {
              id: warehouses.id,
              name: warehouses.nombre,
              location: warehouses.ubicacion,
              owner: warehouses.personaAsignada,
              status: warehouses.estado === 'Disponible' ? true : false,
              register: warehouses.ultimoRegistro,
              idOwner: warehouses.IdpersonaAsignada,
            });
          });
          this.state.set({ warehouses: this.state().warehouses });
        });
      });
  }

  getFormattedWarehouses() {
    return Array.from(this.state().warehouses.values());
  }

  createWarehouse(warehouse: WarehouseCreateInterface): Observable<boolean> {
    const token = this.user.getToken();
    const warehousePayload = {
      nombre: warehouse.name,
      idUbicacion: warehouse.locationId,
      idUserAsignado: warehouse.ownerId,
    };

    return this.http
      .post(`${this.apiUrl}/bodegas`, warehousePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap(() => this.getWarehousesData()), // Refresh data on success
        map(() => true), // Return true on success
        catchError((error) => {
          console.error('Error creating warehouse:', error);
          return of(false); // Return false on error
        }),
      );
  }
}

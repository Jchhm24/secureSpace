import { computed, inject, Injectable, signal } from '@angular/core';
import { UserService } from './user-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { Warehouse } from '@features/warehouses/interfaces';
import { Socket } from 'socket.io-client';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserWarehousesService {
  private user = inject(UserService);
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;
  private wsUrl = environment.WS_URL;
  private socket: Socket | null = null;
  private token = this.user.getToken();

  private state = signal({
    warehouses: new Map<string, Warehouse>(),
  });

  readonly warehouses = computed(() => {
    return Array.from(this.state().warehouses.values());
  });

  readonly totalWarehouses = computed(() => {
    return this.state().warehouses.size;
  });

  constructor() {
    this.getWarehouseByUser(this.user.getUserId());
  }

  getWarehouseByUser(userId: string) {
    if (!userId) return;
    this.http
      .get(`${this.apiUrl}/bodegasUsuario/${userId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching warehouse by user:', error);
          return of(null);
        }),
      )
      .subscribe((response: any) => {
        if (!response) return;
        const warehouse = new Map<string, Warehouse>();

        response.forEach((apiWarehouse: any) => {
          warehouse.set(apiWarehouse.id, this.mapApiToWarehouse(apiWarehouse));
        });
        this.state.set({ warehouses: warehouse });
      });
  }

  openWarehouse(id: string): Observable<{ success: boolean; message: string}> {
    let message = '';
    return this.http
      .post(`${this.apiUrl}/bodega/requestApertura/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(
        tap((response: any) => {
          message = response?.message || 'Bodega abierta con éxito';
        }),
        map(() => ({ success: true, message: message })),
        catchError((error) => {
          console.error('Error opening warehouse:', error);
          return of({ success: false, message: 'Error opening warehouse' });
        }),
      )
  }

  private mapApiToWarehouse(apiData: any): Warehouse {
    return {
      id: apiData.id,
      name: apiData.nombre,
      location: apiData.ubicacion,
      owner: apiData.personaAsignada,
      status: apiData.estado === 'Cerrado',
      register: apiData.ultimoRegistro,
      idOwner: apiData.IdpersonaAsignada,
      locationId: apiData.idubicacion,
    };
  }
}

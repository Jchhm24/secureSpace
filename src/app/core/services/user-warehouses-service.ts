import { computed, inject, Injectable, signal } from '@angular/core';
import { UserService } from './user-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { Warehouse } from '@features/warehouses/interfaces';
import { Socket } from 'socket.io-client';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserWarehousesService {
  private user = inject(UserService);
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;
  private wsUrl = environment.WS_URL;
  private socket: Socket | null = null;

  private state = signal({
    warehouses: new Map<string, Warehouse>(),
  });

  readonly warehouses = computed(() => {
    return Array.from(this.state().warehouses.values());
  });

  readonly totalWarehouses = computed(() => {
    return this.state().warehouses.size;
  });

  constructor(){
    this.getWarehouseByUser(this.user.getUserId());
  }

  getWarehouseByUser(userId: string) {
    const token = this.user.getToken();

    this.http
      .get(`${this.apiUrl}/bodegasUsuario/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

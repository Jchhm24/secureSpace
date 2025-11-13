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
import { io, Socket } from 'socket.io-client';

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

  private socket: Socket | null = null;
  private wsUrl = environment.WS_URL;

  constructor() {
    this.getWarehousesData();
  }

  private mapApiToWarehouse(apiData: any): Warehouse {
    return {
      id: apiData.id,
      name: apiData.nombre,
      location: apiData.ubicacion,
      owner: apiData.personaAsignada,
      status: apiData.estado === 'Disponible',
      register: apiData.ultimoRegistro,
      idOwner: apiData.IdpersonaAsignada,
    };
  }

  getWarehousesData() {
    const token = this.user.getToken();
    this.http
      .get<WarehouseHomeData>(`${this.apiUrl}/bodegasHome`, {
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
      .subscribe((response) => {
        if (!response) return;

        const { info, data } = response;
        this._totalWarehouses.set({
          total: info.total || 0,
          available: info.libres || 0,
          occupied: info.ocupadas || 0,
        });

        const newWarehouses = new Map<string, Warehouse>();
        data.forEach((apiWarehouse) => {
          newWarehouses.set(
            apiWarehouse.id,
            this.mapApiToWarehouse(apiWarehouse),
          );
        });
        this.state.set({ warehouses: newWarehouses });

        this.initializeWebSocket();
      });
  }

  getFormattedWarehouses() {
    return Array.from(this.state().warehouses.values());
  }

  createWarehouse(warehouse: WarehouseCreateInterface): Observable<{success: boolean, message: string}> {
    const token = this.user.getToken();
    const warehousePayload = {
      nombre: warehouse.name,
      idUbicacion: warehouse.locationId,
      idUserAsignado: warehouse.ownerId,
    };

    let message = '';

    return this.http
      .post(`${this.apiUrl}/bodegas`, warehousePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response: any) => {
          message = response?.message || '';
        }),
        map(() => ({success: true, message: message})),
        catchError((error) => {
          console.error('Error creating warehouse:', error);
          return of({success: false, message: 'Failed to create warehouse'});
        }),
      );
  }

  deleteWarehouse(warehouseId: string): Observable<{success: boolean, message: string}> {
    const token = this.user.getToken();
    let message = '';
    return this.http.delete(`${this.apiUrl}/bodegas/${warehouseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).pipe(
      tap((response: any) => {
        message = response?.message || '';
      }),
      map(() => ({success: true, message: message})),
      catchError((error) => {
        console.error('Error deleting warehouse:', error);
        return of({success: false, message: 'Failed to delete warehouse'});
      })
    )
  }

  assignUserToWarehouse(warehouseId: string, userId: string): Observable<{success: boolean, message: string}> {
    const token = this.user.getToken();
    let message = '';

    return this.http.put(
      `${this.apiUrl}/asignar/bodega/${warehouseId}`,
      { idUserAsignado: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).pipe(
      tap((response: any) => {
        message = response?.message || '';
      }),
      map(() => ({success: true, message: message})),
      catchError((error) => {
        console.error('Error assigning user to warehouse:', error);
        return of({success: false, message: 'Failed to assign user to warehouse'});
      })
    );
  }

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket(): void {
    const token = this.user.getToken();

    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }

    this.disconnectWebSocket();

    this.socket = io(this.wsUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupSocketListeners();
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection successful, this only for test
    // this.socket.on('connect', () => {
    //   console.log('WebSocket connected:', this.socket?.id);
    // });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    // Listen for warehouse updates
    this.socket.on('bodegaUpdated', (data: any) => {
      this.handleWarehouseUpdate(this.mapApiToWarehouse(data));
    });

    // Listen for warehouse creation
    this.socket.on('bodegaCreated', (data: any) => {
      this.handleWarehouseCreated(this.mapApiToWarehouse(data));
    });

    // Listen for warehouse deletion
    this.socket.on('bodegaDeleted', (warehouseId: { id: string }) => {
      this.handleWarehouseDeleted(warehouseId.id);
    });

    // Listen for warehouse status changes
    this.socket.on(
      'bodegasFullSync',
      (data: { id: string; status: boolean }) => {
        this.handleWarehouseStatusChange(data);
      },
    );
  }

  /**
   * Handle warehouse update from WebSocket
   */
  private handleWarehouseUpdate(warehouse: Warehouse): void {
    this.state().warehouses.set(warehouse.id, warehouse);
    this.state.set({ warehouses: this.state().warehouses });
  }

  /**
   * Handle new warehouse creation from WebSocket
   */
  private handleWarehouseCreated(warehouse: Warehouse): void {
    this.state().warehouses.set(warehouse.id, warehouse);
    this.state.set({ warehouses: this.state().warehouses });

    // Update totals
    this._totalWarehouses.update((current) => ({
      total: current.total + 1,
      available: warehouse.status ? current.available + 1 : current.available,
      occupied: !warehouse.status ? current.occupied + 1 : current.occupied,
    }));
  }

  /**
   * Handle warehouse deletion from WebSocket
   */
  private handleWarehouseDeleted(warehouseId: string): void {
    const warehouse = this.state().warehouses.get(warehouseId);
    if (warehouse) {
      this.state().warehouses.delete(warehouseId);
      this.state.set({ warehouses: this.state().warehouses });

      // Update totals
      this._totalWarehouses.update((current) => ({
        total: current.total - 1,
        available: warehouse.status ? current.available - 1 : current.available,
        occupied: !warehouse.status ? current.occupied - 1 : current.occupied,
      }));
    }
  }

  /**
   * Handle warehouse status change from WebSocket
   */
  private handleWarehouseStatusChange(data: {
    id: string;
    status: boolean;
  }): void {
    const warehouse = this.state().warehouses.get(data.id);
    if (warehouse) {
      const oldStatus = warehouse.status;
      warehouse.status = data.status;
      this.state().warehouses.set(data.id, warehouse);
      this.state.set({ warehouses: this.state().warehouses });

      // Update availability counts
      if (oldStatus !== data.status) {
        this._totalWarehouses.update((current) => ({
          total: current.total,
          available: data.status
            ? current.available + 1
            : current.available - 1,
          occupied: !data.status ? current.occupied + 1 : current.occupied - 1,
        }));
      }
    }
  }

  /**
   * Emit event to server
   */
  emitEvent(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket is not connected');
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Reconnect WebSocket
   */
  reconnectWebSocket(): void {
    this.disconnectWebSocket();
    this.initializeWebSocket();
  }
}

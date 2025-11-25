import { computed, inject, Injectable, signal } from '@angular/core';
import { UserService } from './user-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { Warehouse } from '@features/warehouses/interfaces';
import { io, Socket } from 'socket.io-client';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { OfflineService } from './offline-service';

@Injectable({
  providedIn: 'root',
})
export class UserWarehousesService {
  private user = inject(UserService);
  private http = inject(HttpClient);
  private offlineService = inject(OfflineService);
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

    // Listen to online/offline status
    this.offlineService.online$.subscribe((isOnline) => {
      if (isOnline) {
        // Reconnect WebSocket when coming back online
        if (!this.socket?.connected) {
          this.initializeWebSocket();
        }
      } else {
        // Disconnect WebSocket when going offline
        this.disconnectWebSocket();
      }
    });

    if (this.offlineService.checkOnlineStatus()) {
      this.initializeWebSocket();
    }
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

  openWarehouse(id: string): Observable<{ success: boolean; message: string }> {
    let message = '';
    return this.http
      .post(`${this.apiUrl}/bodega/requestApertura/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(
        tap((response:any) => {
          message = response?.message || 'Bodega abierta con éxito';
        }),
        map(() => ({ success: true, message: message })),
        catchError((error) => {
          console.error('Error opening warehouse:', error);
          return of({ success: false, message: 'Error opening warehouse' });
        }),
      );
  }

  private mapApiToWarehouse(apiData: any): Warehouse {
    return {
      id: apiData.id,
      name: apiData.nombre,
      location: apiData.ubicacion,
      owner: apiData.personaAsignada,
      status: apiData.estado === 'abierto',
      register: apiData.ultimoRegistro,
      idOwner: apiData.IdpersonaAsignada,
      locationId: apiData.idubicacion,
    };
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

    // Don't initialize WebSocket if offline
    if (!this.offlineService.checkOnlineStatus()) {
      console.log('Offline - WebSocket initialization skipped');
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

    // Connection successful
    this.socket.on('connect', () => {
      // console.log('WebSocket connected:', this.socket?.id);

      const userId = this.user.getUserId();
      // Emit event to join user room immediately upon connection
      if (userId) {
        // console.log(`Joining room for user: ${userId}`);
        this.socket?.emit('joinUserRoom', { userId: userId });
      }
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    // Listen for updates
    this.socket.on('userStoragesUpdated', (data: any) => {
      const updatedWarehouses = new Map<string, Warehouse>();

      data.forEach((dataWarehouse: any) => {
        const warehouse = this.mapApiToWarehouse(dataWarehouse);
        updatedWarehouses.set(warehouse.id, warehouse);
      });

      this.state.set({ warehouses: updatedWarehouses });
    });
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
}

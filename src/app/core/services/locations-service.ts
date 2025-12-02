import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environment/environment';
import { UserService } from './user-service';
import { selectLocations, Location } from '@features/locations/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;
  private user = inject(UserService);
  private socket: Socket | null = null;
  private wsUrl = environment.WS_URL;

  private state = signal({
    locations: new Map<string, Location>(),
    selectLocations: new Map<string, selectLocations>(),
  });

  locations = computed(() => Array.from(this.state().locations.values()));

  selectLocations = computed(() =>
    Array.from(this.state().selectLocations.values()),
  );

  constructor() {
    this.getLocations();
  }

  getLocations() {
    const token = this.user.getToken();
    this.http
      .get<{ data: Location[] }>(`${this.apiUrl}/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .subscribe((result: any) => {
        const newLocations = new Map<string, Location>(
          result.data.map((location: any) => [
            location.id,
            {
              id: location.id,
              location: location.nombre,
              registryDate: new Date(location.fechaCreacion),
              active: location.activa || false,
            },
          ]),
        );

        this.state.update((state) => ({
          ...state,
          locations: newLocations,
        }));

        this.initializeWebSocket();
      });
  }

  getSelectLocations() {
    const token = this.user.getToken();
    this.http
      .get<{ data: selectLocations[] }>(`${this.apiUrl}/locationsSelect`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .subscribe((result) => {
        const newSelectLocations = new Map(
          result.data.map((location) => [location.id, location]),
        );

        this.state.update((state) => ({
          ...state,
          selectLocations: newSelectLocations,
        }));
      });
  }

  createLocation(
    name: string,
  ): Observable<{ success: boolean; message: string }> {
    const token = this.user.getToken();
    let message = '';

    return this.http
      .post(
        `${this.apiUrl}/locations`,
        { nombre: name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .pipe(
        tap((response: any) => {
          message = response?.message || '';
        }),
        map(() => ({ success: true, message: message })),
        catchError((error) => {
          console.error('Error creating location:', error);
          return of({ success: false, message: 'Failed to create location' });
        }),
      );
  }

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

  updateLocation(
    name: string,
    active: boolean,
    id: string,
  ): Observable<{ success: boolean; message: string }> {
    const token = this.user.getToken();
    let message = '';

    return this.http
      .put(
        `${this.apiUrl}/locations/${id}`,
        { nombre: name, activo: active },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .pipe(
        tap((response: any) => {
          message = response?.message || '';
        }),
        map(() => ({ success: true, message: message })),
        catchError((error) => {
          console.error('Error updating location:', error);
          return of({ success: false, message: 'Failed to update location' });
        }),
      );
  }

  deleteLocation(
    id: string,
  ): Observable<{ success: boolean; message: string }> {
    const token = this.user.getToken();
    let message = '';

    return this.http
      .delete(`${this.apiUrl}/locations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        tap((response: any) => {
          message = response?.message || '';
        }),
        map(() => ({ success: true, message: message })),
        catchError((error) => {
          console.error('Error deleting location:', error);
          return of({ success: false, message: error.error?.error || 'Failed to delete location' });
        }),
      );
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to Locations WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // listen creation of location
    this.socket.on('ubicacionCreated', (data: any) => {
      const newLocation: Location = {
        id: data.id,
        location: data.nombre,
        registryDate: new Date(data.fechaCreacion),
        active: data.activa || false,
      };

      this.state.update((state) => {
        const updatedLocations = new Map(state.locations);
        updatedLocations.set(newLocation.id, newLocation);
        return {
          ...state,
          locations: updatedLocations,
        };
      });
    });

    // listen update of location
    this.socket.on('ubicacionUpdated', (data: any) => {
      const updatedLocation: Location = {
        id: data.id,
        location: data.nombre,
        registryDate: new Date(data.fechaCreacion),
        active: data.activa || false,
      };

      this.state.update((state) => {
        const updatedLocations = new Map(state.locations);
        updatedLocations.set(updatedLocation.id, updatedLocation);
        return {
          ...state,
          locations: updatedLocations,
        };
      });
    });

    this.socket.on('ubicacionDeleted', (data: any) => {
      const locationId = typeof data === 'string' ? data : data?.id;

      if (locationId) {
        this.state.update((state) => {
          const updatedLocations = new Map(state.locations);
          updatedLocations.delete(locationId);
          return {
            ...state,
            locations: updatedLocations,
          };
        });
      }
    });
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  reconnectWebSocket(): void {
    this.disconnectWebSocket();
    this.initializeWebSocket();
  }
}

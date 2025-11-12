import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environment/environment';
import { UserService } from './user-service';
import { selectLocations, Location } from '@features/locations/interfaces';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;
  private user = inject(UserService);
 
  private state = signal({
    locations: new Map<number, Location>(),
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
        const newLocations = new Map<number, Location>(
          result.data.map((location: any) => [
            location.id,
            {
              id: location.id,
              location: location.nombre,
              registryDate: new Date(location.fechaCreacion),
            },
          ]),
        );

        this.state.update((state) => ({
          ...state,
          locations: newLocations,
        }));
      });
  }

  getFormattedLocations() {
    return Array.from(this.state().locations.values());
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
}

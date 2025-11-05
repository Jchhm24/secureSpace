import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environment/environment';
import { Locations } from '@features/locations/const/locations-data';
import { of } from 'rxjs';
import { UserService } from './user-service';
import { selectLocations, Location } from '@features/locations/interfaces';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;
  private user = inject(UserService);

  // TODO: Become this state to private when i work on the locations service more
  state = signal({
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
    const mockLocations: Location[] = Locations;

    of(mockLocations).subscribe((result) => {
      const newLocations = new Map(
        result.map((location) => [location.id, location]),
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

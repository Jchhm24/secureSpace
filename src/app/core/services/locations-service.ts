import { Injectable, signal } from '@angular/core';
import { Locations } from '@features/locations/const/locations-data';
import { Location } from '@features/locations/interfaces/locations-interface';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  state = signal({
    locations: new Map<number, Location>(),
  });

  constructor() {
    this.getLocations();
  }

  getLocations() {
    const mockLocations: Location[] = Locations;

    of(mockLocations).subscribe((result) => {
      const newLocations = new Map(
        result.map((location) => [location.id, location]),
      );

      this.state.set({ locations: newLocations });
    });
  }

  getFormattedLocations() {
    return Array.from(this.state().locations.values());
  }
}

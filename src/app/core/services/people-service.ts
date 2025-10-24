import { Injectable, signal } from '@angular/core';
import { Peoples } from '@features/people/const/people-data';
import { People } from '@features/people/interfaces/people-interface';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  state = signal({
    people: new Map<number, People>(),
  });

  constructor() {
    this.getPeople();
  }

  getPeople() {
    const mockPeople: People[] = Peoples;

    of(mockPeople).subscribe((result) => {
      const newPeople = new Map(result.map((people) => [people.id, people]));

      this.state.set({ people: newPeople });
    });
  }

  getFormattedPeoples() {
    return Array.from(this.state().people.values());
  }
}

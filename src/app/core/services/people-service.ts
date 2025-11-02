import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environment/environment';
import { UserService } from './user-service';
import { PeopleData, People } from '@features/people/interfaces';

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;
  private user = inject(UserService);

  state = signal({
    people: new Map<string, People>(),
  });

  constructor() {
    this.getPeople();
  }

  getPeople() {
    const token = this.user.getToken();

    this.http
      .get<PeopleData>(`${this.apiUrl}/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe((response: PeopleData) => {
        this.adaptPeopleDataResponse(response);
      });
  }

  getFormattedPeoples() {
    return Array.from(this.state().people.values());
  }

  private adaptPeopleDataResponse(data: PeopleData): void {
    data.data.forEach((person) => {
      this.state().people.set(person.id, {
        id: person.id,
        name: person.nombre,
        lastName: person.apellido,
        email: person.email,
        phone: person.telefono,
        role: person.rol === 'usuario' ? 'user' : 'admin',
        blocked: person.bloqueado,
        tokenFCM: person.tokenFCM,
      });
    });

    this.state.set({
      people: this.state().people,
    });
  }
}

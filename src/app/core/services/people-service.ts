import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environment/environment';
import { UserService } from './user-service';
import { PeopleData, People, selectPeople } from '@features/people/interfaces';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { CreatePeople } from '@features/people/interfaces/create-people-interface';

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;
  private user = inject(UserService);

  private state = signal({
    people: new Map<string, People>(),
    selectPeople: new Map<string, selectPeople>(),
  });

  people = computed(() => Array.from(this.state().people.values()));
  selectPeople = computed(() => Array.from(this.state().selectPeople.values()));

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

  getSelectPeople() {
    const token = this.user.getToken();
    this.http
      .get<{ data: selectPeople[] }>(`${this.apiUrl}/usuariosSelect`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe((result) => {
        const newSelectPeople = new Map(
          result.data.map((person) => [person.id, person]),
        );

        this.state.update((state) => ({
          ...state,
          selectPeople: newSelectPeople,
        }));
      });
  }

  createPerson(
    person: CreatePeople,
  ): Observable<{ success: boolean; message: string }> {
    const payload = {
      nombre: person.name,
      apellido: person.lastName,
      email: person.email,
      password: person.password,
    };
    const token = this.user.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .post(`${this.apiUrl}/auth/register`, payload, { headers })
      .pipe(
        switchMap((response:any) => {
          const tokenAuth = response.token;
          const authHeaders = new HttpHeaders().set('Authorization', `Bearer ${tokenAuth}`);
          return this.http
            .post(`${this.apiUrl}/auth/me`, payload, { headers: authHeaders }) // Send empty object, not payload
            .pipe(
              tap(() => {
                this.getPeople();
              }),
              map(() => ({
                success: true,
                message: 'Persona creada con éxito',
              })),
              catchError((error) => {
                console.error('Error in auth:', error);
                const errorMessage =
                  error.error?.error ||
                  error.error?.message ||
                  'Failed to verify user creation';
                return of({
                  success: false,
                  message: errorMessage,
                });
              }),
            );
        }),
        catchError((error) => {
          console.error('Error in register:', error);
          const errorMessage =
            error.error?.error ||
            error.error?.message ||
            'Failed to create person';
          return of({
            success: false,
            message: errorMessage,
          });
        }),
      );
  }

  deletePerson(personId: string):Observable<{success: boolean; message: string}>{
    const token = this.user.getToken();
    let message = '';
    return this.http.delete(`${this.apiUrl}/usuario/${personId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).pipe(
      tap((response: any) => {
        message = response?.message || '';
      }),
      map(() => ({success: true, message: message})),
      catchError((error) => {
        console.error('Error deleting person:', error);
        return of({success: false, message: error.error?.error});
      })
    )
  }

  lockUnlockPerson(personId: string):Observable<{success: boolean; message: string}>{
    const token = this.user.getToken();
    let message = '';

    return this.http.post(`${this.apiUrl}/blockUsuario/${personId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).pipe(
      tap((response: any) => {
        console.log('Lock/Unlock response:', response);
        message = response?.message || '';
      }),
      map(() => ({success: true, message: message})),
      catchError((error) => {
        console.error('Error locking/unlocking person:', error);
        return of({success: false, message: error.error?.error});
      })
    )
  }

  private adaptPeopleDataResponse(data: PeopleData): void {
    const newPeopleMap = new Map<string, People>();
    data.data.forEach((person) => {
      newPeopleMap.set(person.id, {
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

    this.state.update((state) => ({
      ...state,
      people: newPeopleMap,
    }));
  }
}

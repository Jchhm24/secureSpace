import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  UserCredential,
} from '@angular/fire/auth';
import { environment } from '@environment/environment';
import { UserInterface } from '@shared/interfaces/user-interface';
import {
  catchError,
  finalize,
  from,
  Observable,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { UserService } from './user-service';

export interface AuthResponse {
  user: UserInterface;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private apiUrl = environment.API_URL;
  private userService = inject(UserService);

  // **Auth methods with Google ** //
  signInWithGoogle(): Observable<UserInterface> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap((userCredential: UserCredential) => {
        // get the id token from user
        return from(userCredential.user.getIdToken());
      }),
      switchMap((idToken: string | null) => {
        const token = idToken;
        if (!token) {
          return throwError(
            () => new Error('No se pudo obtener el token de autenticación'),
          );
        }

        const headers = new HttpHeaders().set(
          'Authorization',
          `Bearer ${token}`,
        );
        return this.http
          .post<UserInterface>(`${this.apiUrl}/auth/me`, {}, { headers })
          .pipe(
            tap((meResponse) => {
              let user = meResponse;
              user.role = user.role !== 'admin' ? 'user' : 'admin'; // Ensure role is either 'admin' or 'user'

              this.setSession({ token: token, user: user });
            }),
          );
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  // ** Auth methods with email and password ** //
  signIn(email: string, password: string): Observable<UserInterface> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, {
        email: email,
        password: password,
      })
      .pipe(
        switchMap((loginResponse) => {
          const token = loginResponse.token;
          // Then call /auth/me with the token
          const headers = new HttpHeaders().set(
            'Authorization',
            `Bearer ${token}`,
          );

          return this.http
            .post<UserInterface>(`${this.apiUrl}/auth/me`, {}, { headers })
            .pipe(
              tap((meResponse) => {
                let user = meResponse;
                user.role = user.role !== 'admin' ? 'user' : 'admin'; // Ensure role is either 'admin' or 'user'

                this.setSession({ token: token, user: user });
              }),
            );
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      catchError((error) => this.handleError(error)),
      finalize(() => {
        this.clearSession();
      }),
    );
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  get authState$(): Observable<User | null> {
    return new Observable((observer) => {
      return this.auth.onAuthStateChanged(observer);
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setSession(response: AuthResponse) {
    localStorage.setItem('token', response.token);
    this.userService.setUser(response.user);
  }

  private clearSession() {
    localStorage.removeItem('token');
    this.userService.clearUser();
  }

  private handleError(error: any) {
    console.error('Error en la API', error);
    return throwError(
      () => new Error(error.error?.message || 'Error en el login con Google'),
    );
  }
}

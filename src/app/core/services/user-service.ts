import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { UserInterface } from '@shared/interfaces/user-interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private platformId = inject(PLATFORM_ID);
  private userSignal = signal<UserInterface | null>(null);
  readonly user = this.userSignal.asReadonly();

  constructor() {
    this.loadUserFromStorage();
  }

  setUser(user: UserInterface | null): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.userSignal.set(user);
    } else {
      this.clearUser();
    }
  }

  clearUser(): void {
    localStorage.removeItem('user');
    this.userSignal.set(null);
  }

  getUserRole(): 'admin' | 'user' {
    return this.userSignal()?.role || 'user';
  }

  getToken():string {
    if (!isPlatformBrowser(this.platformId)) return '';

    return localStorage.getItem('token') || '';
  }

  isAuthenticated(): boolean {
    return this.userSignal() !== null;
  }

  private loadUserFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const rawData = JSON.parse(userData);
        const user: UserInterface = {
          id: rawData.id,
          name: rawData.nombre,
          lastName: rawData.apellido,
          email: rawData.email,
          photoUrl: rawData.fotoPerfil,
          role: rawData.rol === 'admin' ? 'admin' : 'user',
        };
        this.userSignal.set(user);
        console.log('Loaded user from localStorage:', this.user());
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
        this.clearUser();
      }
    }
  }
}

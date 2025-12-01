import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environment/environment';
import { UserService } from './user-service';
import { io, Socket } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import {
  Notification,
  ListNotifications,
} from '@features/notifications/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserNotificationsService {
  private user = inject(UserService);
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;
  private wsUrl = environment.WS_URL;
  private socket: Socket | null = null;

  private state = signal({
    notifications: new Map<string, Notification>(),
  });

  private notifications = computed<Notification[]>(() =>
    Array.from(this.state().notifications.values()),
  );

  countNotifications = computed(
    () => this.notifications().filter((notification) => !notification.read).length,
  );

  groupedNotifications = computed<ListNotifications>(() => {
    const notifications = this.notifications();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDate = (date1: Date, date2: Date) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    const grouped: ListNotifications = {
      today: [],
      yesterday: [],
      other: [],
    };

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.date);
      if (isSameDate(notificationDate, today)) {
        grouped.today.push(notification);
      } else if (isSameDate(notificationDate, yesterday)) {
        grouped.yesterday.push(notification);
      } else {
        grouped.other.push(notification);
      }
    });

    return grouped;
  });

  constructor() {
    this.getNotifications();
    this.initializeWebSocket();
  }

  getNotifications() {
    const token = this.user.getToken();

    if (!token) {
      console.error(
        'El token no esta disponible para obtener las notificaciones',
      );
      return;
    }

    this.http
      .get(`${this.apiUrl}/notificaciones/${this.user.getUserId()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener las notificaciones', error);
          return of([]);
        }),
      )
      .subscribe((response: any) => {
        if (!response) return;

        const { data } = response;
        const newNotifications = new Map<string, Notification>();
        data.forEach((notification: any) => {
          newNotifications.set(
            notification.id,
            this.formatNotifications(notification),
          );
        });
        this.state.set({ notifications: newNotifications });
      });
  }

  readedNotification(
    id: string,
  ): Observable<{ success: boolean; message: string }> {
    const token = this.user.getToken();

    const notification = this.notifications().find(n => n.id === id);

    if(notification?.read){
      return of({
        success: true,
        message: 'La notificación ya esta marcada como leida'
      })
    }

    let message = ''

    return this.http
      .put(`${this.apiUrl}/notificacion/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response: any) => {
          message = response?.message || ''
        }),
        map(() => ({success: true, message})),
        catchError((error) => {
          console.error('Error al marcar como leido la notifiación', error);
          return of({ success: false, message: 'Failed to update warehouse' });
        }),
      );
  }

  private formatNotifications(data: any): Notification {
    return {
      id: data.id,
      title: data.titulo,
      message: data.mensaje,
      read: data.leido,
      date: data.fecha,
    };
  }

  private initializeWebSocket() {
    const token = this.user.getToken();

    if (!token) {
      console.error('El token no esta disponible para el websocket');
      return;
    }

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

  private setupSocketListeners() {
    // this.socket?.on('connect', () => {
    //   console.log('Conectado al websocket');
    // });

    this.socket?.on('disconnect', () => {
      console.log('Desconectado del websocket');
    });

    this.socket?.on('error', (error) => {
      console.error('Error en el websocket', error);
    });

    this.socket?.on('NotificationsFull', (userId: string) => {
      console.log('Notificaciones completadas para el usuario', userId);
    });
  }
}

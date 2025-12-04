import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environment/environment';
import { UserService } from './user-service';
import { io, Socket } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { OfflineService } from './offline-service';
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
    () =>
      this.notifications().filter((notification) => !notification.read).length,
  );

  groupedNotifications = computed<ListNotifications>(() => {
    const notifications = this.notifications();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const grouped: ListNotifications = {
      today: [],
      yesterday: [],
      other: [],
    };

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.date);
      if (notificationDate >= today) {
        grouped.today.push(notification);
      } else if (notificationDate >= yesterday) {
        grouped.yesterday.push(notification);
      } else {
        grouped.other.push(notification);
      }
    });

    const sortNotifications = (list: Notification[]) => {
      return list.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    };

    grouped.today = sortNotifications(grouped.today);
    grouped.yesterday = sortNotifications(grouped.yesterday);
    grouped.other = sortNotifications(grouped.other);

    return grouped;
  });

  private offlineService = inject(OfflineService);

  constructor() {
    this.getNotifications();

    // Listen to online/offline status
    this.offlineService.online$.subscribe((isOnline) => {
      if (isOnline) {
        // Reconnect WebSocket when coming back online
        if (!this.socket?.connected) {
          this.initializeWebSocket();
        }
        // Update last sync time when fetching fresh data
        this.offlineService.updateLastSyncTime();
      } else {
        // Disconnect WebSocket when going offline
        this.disconnectWebSocket();
      }
    });
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

        // Only initialize WebSocket if online
        if (this.offlineService.checkOnlineStatus()) {
          this.initializeWebSocket();
        }

        // Update last sync time on successful data fetch
        this.offlineService.updateLastSyncTime();
      });
  }

  readedNotification(
    id: string,
  ): Observable<{ success: boolean; message: string }> {
    const token = this.user.getToken();

    const notification = this.notifications().find((n) => n.id === id);

    if (notification?.read) {
      return of({
        success: true,
        message: 'La notificación ya esta marcada como leida',
      });
    }

    let message = '';

    return this.http
      .put(`${this.apiUrl}/notificacion/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response: any) => {
          message = response?.message || '';
        }),
        map(() => ({ success: true, message })),
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

    // Don't initialize WebSocket if offline
    if (!this.offlineService.checkOnlineStatus()) {
      console.log('Offline - WebSocket initialization skipped');
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

  private disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupSocketListeners() {
    if (!this.socket) {
      console.error('El socket no esta disponible');
      return;
    }

    this.socket.on('connect', () => {
      console.log('Conectado al websocket');

      // Join user room to receive notifications
      const userId = this.user.getUserId();
      if (userId) {
        this.socket?.emit('joinUserRoom', { userId: userId });
        console.log(`Joined notification room for user: ${userId}`);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del websocket');
    });

    this.socket.on('error', (error) => {
      console.error('Error en el websocket', error);
    });

    this.socket.on('NotificationCreated', (data: any) => {
      // Update state with new notification
      const notification = this.formatNotifications(data);
      this.state.update((current) => {
        const updated = new Map(current.notifications);
        updated.set(notification.id, notification);
        return { notifications: updated };
      });
    });

    this.socket.on('NotificationsFull', (notifications: any) => {
      const newNotifications = new Map<string, Notification>();
      notifications.forEach((notification: any) => {
        newNotifications.set(
          notification.id,
          this.formatNotifications(notification),
        );
      });
      this.state.update(() => {
        return { notifications: newNotifications };
      });
    });

    this.socket.on('NotificationUpdated', (data: any) => {
      // Update the notification in state
      const notification = this.formatNotifications(data);
      this.state.update((current) => {
        const updated = new Map(current.notifications);
        updated.set(notification.id, notification);
        return { notifications: updated };
      });
    });

    this.socket.on('NotificationDelete', (data: any) => {
      // Remove notification from state
      this.state.update((current) => {
        const updated = new Map(current.notifications);
        updated.delete(data.id);
        return { notifications: updated };
      });
    });
  }
}

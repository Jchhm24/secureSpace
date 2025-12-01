import { Component, inject, input } from '@angular/core';
import { TypeNotificationBadge } from '../type-notification-badge/type-notification-badge';
import { Notification } from '@features/notifications/interfaces';
import { UserNotificationsService } from '@core/services/user-notifications-service';
import { NgClass } from '@angular/common';
import { ToastService } from '@core/services/toast-service';

@Component({
  selector: 'app-list-notifications',
  imports: [TypeNotificationBadge, NgClass],
  templateUrl: './list-notifications.html',
  styleUrl: './list-notifications.css',
})
export class ListNotificationsComponent {
  title = input.required<string>();
  notifications = input.required<Notification[]>();

  private notificationsService = inject(UserNotificationsService);
  private toastService = inject(ToastService);

  readedNotification(id: string) {
    this.notificationsService
      .readedNotification(id)
      .subscribe((response: { success: boolean; message: string }) => {
        if (response.success) {
          this.toastService.show(response.message, 'success');
        } else {
          this.toastService.show(response.message, 'error');
        }
      });
  }
}

import { Component, inject } from '@angular/core';
import { UserNotificationsService } from '@core/services/user-notifications-service';
import { ListNotifications } from './interfaces';
import { LayoutService } from '@core/services/layout-service';
import { ListNotificationsComponent } from './components/list-notifications/list-notifications';

@Component({
  selector: 'app-notifications',
  imports: [ListNotificationsComponent],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  private layoutService = inject(LayoutService);
  private notificationService = inject(UserNotificationsService);
  protected groupedNotifications = this.notificationService.groupedNotifications;

  constructor() {
    this.layoutService.setConfig({
      title: 'Notificaciones',
      showAction: false,
    })
    this.notificationService.getNotifications();
  }

}

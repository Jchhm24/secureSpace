import { Notification } from './notification-interface';

export interface ListNotifications {
  today: Notification[];
  yesterday: Notification[];
  other: Notification[];
}

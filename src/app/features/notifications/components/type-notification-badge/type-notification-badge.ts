import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { IconService } from '@core/services/icon-service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-type-notification-badge',
  imports: [NgClass, LucideAngularModule],
  templateUrl: './type-notification-badge.html',
  styleUrl: './type-notification-badge.css',
})
export class TypeNotificationBadge {

  title = input.required<string>();

  protected icons = inject(IconService).icons;
}

import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { IconService } from '@core/services/icon-service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-badge-enable',
  imports: [LucideAngularModule, NgClass],
  templateUrl: './badge-enable.html',
  styleUrl: './badge-enable.css'
})
export class BadgeEnable {
  enabled = input<boolean>(true);

  icons = inject(IconService).icons;
}

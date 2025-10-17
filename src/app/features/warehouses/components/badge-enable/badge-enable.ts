import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { CircleAlert, CircleCheck, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-badge-enable',
  imports: [LucideAngularModule, NgClass],
  templateUrl: './badge-enable.html',
  styleUrl: './badge-enable.css'
})
export class BadgeEnable {
  enabled = input<boolean>(true);

  icons = {
    circleCheck: CircleCheck,
    circleAlert: CircleAlert
  }
}

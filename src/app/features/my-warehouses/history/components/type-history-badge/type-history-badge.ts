import { Component, inject, input } from '@angular/core';
import { HistoryInterface } from '../../interface/history-interface';
import { LucideAngularModule } from 'lucide-angular';
import { IconService } from '@core/services/icon-service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-type-history-badge',
  imports: [LucideAngularModule, NgClass],
  templateUrl: './type-history-badge.html',
  styleUrl: './type-history-badge.css',
})
export class TypeHistoryBadge {
  type = input.required<HistoryInterface['type']>();

  protected icons = inject(IconService).icons;
}

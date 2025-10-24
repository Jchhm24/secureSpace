import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { IconService } from '@core/services/icon-service';
import { WarehouseCardIconsType } from '@shared/types/warehouse-card-icons-type';
import { LucideAngularModule } from 'lucide-angular';


@Component({
  selector: 'app-warehouse-card',
  imports: [LucideAngularModule, NgClass],
  templateUrl: './warehouse-card.html',
  styleUrl: './warehouse-card.css',
})
export class WarehouseCard {
  title = input.required<string>();
  total = input.required<number>();
  icon = input.required<WarehouseCardIconsType>();

  icons = inject(IconService).icons;
}

import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { WarehouseCardIconsType } from '@shared/types/warehouse-card-icons-type';
import { LucideAngularModule, Warehouse, LockOpen, Lock } from 'lucide-angular';


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

  icons = {
    warehouse: Warehouse,
    lockOpen: LockOpen,
    lock: Lock,
  }
}

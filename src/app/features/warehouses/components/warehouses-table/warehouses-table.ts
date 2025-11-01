import {
  Component,
  effect,
  inject,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputComponent } from '@shared/components/input-component/input-component';
import { LucideAngularModule } from 'lucide-angular';
import { BadgeEnable } from '../badge-enable/badge-enable';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { WarehouseService } from '@core/services/warehouse-service';
import { Warehouse } from '@features/warehouses/interfaces/warehouse-interface';
import { paginateTable } from '@shared/utils/helpers/paginateTable';
import { NgClass } from '@angular/common';
import { IconService } from '@core/services/icon-service';
import { DateFormatPipe } from '@shared/pipes/date-format-pipe';
import { BreakpointObserver } from '@angular/cdk/layout';
import { QrGenerate } from '@shared/components/qr-generate/qr-generate';

@Component({
  selector: 'app-warehouses-table',
  imports: [
    LucideAngularModule,
    InputComponent,
    BadgeEnable,
    ButtonIcon,
    NgClass,
    DateFormatPipe,
    QrGenerate,
  ],
  templateUrl: './warehouses-table.html',
  styleUrl: './warehouses-table.css',
})
export class WarehousesTable implements OnInit {
  private readonly ITEMS_PER_PAGE = 5;

  icons = inject(IconService).icons;

  protected searchControl = new FormControl('');
  protected warehouseService = inject(WarehouseService);
  protected warehouses = signal<Warehouse[]>([]);
  protected groupedWarehouses = signal<Warehouse[][]>([]);
  protected index_page = signal(0);

  protected qrGenerate = model<{
    id: string;
    opened: boolean;
  }>({
    id: '',
    opened: false,
  });

  ngOnInit(): void {
    this.getPaginatedData(
      this.ITEMS_PER_PAGE,
      this.warehouseService.getFormattedWarehouses(),
    );
  }

  protected inputSize = signal('520px');

  private breakpointObserver = inject(BreakpointObserver);

  private breakpointLogic = effect(() => {
    this.breakpointObserver.observe('(width <= 604px)').subscribe((result) => {
      if (result.matches) {
        this.inputSize.set('100%');
      } else {
        this.inputSize.set('520px');
      }
    });
  });

  getPaginatedData(limit: number, data: Warehouse[] | undefined): void {
    const tableIndications = paginateTable(limit, data);
    this.groupedWarehouses.set(tableIndications.groupedData);
    this.warehouses.set(tableIndications.paginatedData);
  }

  changePage(page: number): void {
    this.index_page.set(page);
    this.warehouses.set(this.groupedWarehouses()[page] || []);
  }

  functionButton() {
    alert('solo para representar el boton');
  }

  openQrGenerate = (id: string) => {
    this.qrGenerate.set({ id: id, opened: true });
  }
}

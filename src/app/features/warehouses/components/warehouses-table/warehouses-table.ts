import { Component, effect, inject, model, signal } from '@angular/core';
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
import { BreakpointObserver } from '@angular/cdk/layout';
import { QrGenerate } from '@shared/components/qr-generate/qr-generate';
import { useToggle } from '@shared/hooks/use-toggle';
import { AssignUserModal } from '../assign-user-modal/assign-user-modal';
import { ToastService } from '@core/services/toast-service';
import { ConfirmActionModalService } from '@core/services/confirm-action-modal-service';
import e from 'express';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-warehouses-table',
  imports: [
    LucideAngularModule,
    InputComponent,
    BadgeEnable,
    ButtonIcon,
    NgClass,
    QrGenerate,
    AssignUserModal
  ],
  templateUrl: './warehouses-table.html',
  styleUrl: './warehouses-table.css',
})
export class WarehousesTable {
  private readonly ITEMS_PER_PAGE = 5;

  icons = inject(IconService).icons;

  protected searchControl = new FormControl('');
  protected warehouseService = inject(WarehouseService);
  protected warehouseState = this.warehouseService.state;
  protected warehouses = signal<Warehouse[]>([]);
  protected groupedWarehouses = signal<Warehouse[][]>([]);
  protected index_page = signal(0);

  protected modal = useToggle();
  protected assignUserModal = useToggle();
  protected warehouseId = signal('');

  protected idQrGenerate = signal('');

  private toastService = inject(ToastService);
  private actionModalService = inject(ConfirmActionModalService);
  private clickSubModal?: Subscription;

  private warehouseData = effect(() => {
    const warehouses = this.warehouseService.getFormattedWarehouses();
    this.getPaginatedData(this.ITEMS_PER_PAGE, warehouses);
  });

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

  toggleQrGenerate = (id: string) => {
    this.idQrGenerate.set(id);
    this.modal.toggle();
  };

  openModalAssignUser(warehouseId: string){
    this.warehouseId.set(warehouseId);
    this.assignUserModal.toggle();
  }

  deleteWarehouse(id: string){
    this.warehouseService.deleteWarehouse(id).subscribe((response: {success: boolean, message: string}) => {
      if(response.success){
        this.toastService.show(response.message, 'success');
      }else {
        this.toastService.show(response.message, 'error');
      }
    });
  }

  openConfirmActionModal(warehouseId: string){
    const warehouse = this.warehouses().find(w => w.id === warehouseId);
    if(!warehouse) return;
    this.actionModalService.setConfig({
      title: '¿Estás seguro de que deseas eliminar este almacén?',
      message: `Esta acción eliminará el almacén "${warehouse.name}" de forma permanente.`,
      iconType: 'warning',
      buttonText: 'Eliminar',
    });

    this.clickSubModal = this.actionModalService.onButtonClick$.subscribe(() => {
      this.deleteWarehouse(warehouseId);
      this.clickSubModal?.unsubscribe();
      this.actionModalService.closeModal();
    })

    this.actionModalService.openModal();
  }
}

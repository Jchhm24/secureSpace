import { NgClass } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IconService } from '@core/services/icon-service';
import { LocationsService } from '@core/services/locations-service';
import { Location } from '@features/locations/interfaces/locations-interface';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { InputComponent } from '@shared/components/input-component/input-component';
import { useToggle } from '@shared/hooks/use-toggle';
import { DateFormatPipe } from '@shared/pipes/date-format-pipe';
import { paginateTable } from '@shared/utils/helpers/paginateTable';
import { LucideAngularModule } from 'lucide-angular';
import { UpdateLocationModal } from '../update-location-modal/update-location-modal';
import { ToastService } from '@core/services/toast-service';
import { ConfirmActionModalService } from '@core/services/confirm-action-modal-service';
import { Subscription } from 'rxjs';
import { ButtonActionsCompact } from '@shared/components/button-actions-compact/button-actions-compact';
import { ButtonActionCompact } from '@shared/interfaces/button-action-compact-interface';

@Component({
  selector: 'app-locations-table',
  imports: [
    LucideAngularModule,
    InputComponent,
    ButtonIcon,
    DateFormatPipe,
    NgClass,
    UpdateLocationModal,
    ButtonActionsCompact,
  ],
  templateUrl: './locations-table.html',
  styleUrl: './locations-table.css',
})
export class LocationsTable {
  private readonly ITEMS_PER_PAGE = 5;

  protected searchControl = new FormControl('');
  protected locationsService = inject(LocationsService);
  protected locations = signal<Location[]>([]);
  protected groupedLocations = signal<Location[][]>([]);
  protected index_page = signal(0);
  protected location = signal<Location>({} as Location);
  protected modal = useToggle();
  private toastService = inject(ToastService);
  private modalActionService = inject(ConfirmActionModalService);
  private clickSubModal?: Subscription;

  protected buttonsActions: ButtonActionCompact[] = [
    {
      label: 'Editar',
      action: (locationId?: string) => {
        if (locationId) {
          const location = this.locations().find(
            (loc) => loc.id === locationId,
          );
          if (location) this.openUpdateLocationModal(location);
        }
      },
    },
    {
      label: 'Eliminar',
      action: (locationId?: string) => {
        if (locationId) this.openActionModal(locationId);
      },
    },
  ];

  protected icons = inject(IconService).icons;

  private locationsData = effect(() => {
    const locations = this.locationsService.locations();
    this.getPaginatedDate(this.ITEMS_PER_PAGE, locations);
  });

  getPaginatedDate(limit: number, data: Location[] | undefined): void {
    const tableIndications = paginateTable(limit, data);
    this.groupedLocations.set(tableIndications.groupedData);
    this.locations.set(tableIndications.paginatedData);
  }

  changePage(page: number): void {
    this.index_page.set(page);
    this.locations.set(this.groupedLocations()[page] || []);
  }

  openUpdateLocationModal(location: Location): void {
    this.location.set(location);
    this.modal.open();
  }

  deleteLocation(id: string): void {
    this.locationsService
      .deleteLocation(id)
      .subscribe((response: { success: boolean; message: string }) => {
        if (response.success) {
          this.toastService.show(response.message, 'success');
          this.modalActionService.closeModal();
        } else {
          this.toastService.show(response.message, 'error');
        }
      });
  }

  openActionModal(locationId: string): void {
    const location = this.locations().find((loc) => loc.id === locationId);
    if (!location) return;

    this.modalActionService.setConfig({
      title: '¿Estás seguro de que deseas eliminar esta ubicación?',
      message: `Esta acción eliminará la ubicación "${location.location}" de forma permanente.`,
      iconType: 'warning',
      buttonText: 'Eliminar',
    });

    this.clickSubModal = this.modalActionService.onButtonClick$.subscribe(
      () => {
        this.deleteLocation(locationId);
        this.clickSubModal?.unsubscribe();
      },
    );

    this.modalActionService.openModal();
  }
}

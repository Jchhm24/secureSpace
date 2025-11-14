import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconService } from '@core/services/icon-service';
import { LocationsService } from '@core/services/locations-service';
import { ToastService } from '@core/services/toast-service';
import { WarehouseService } from '@core/services/warehouse-service';
import { Warehouse } from '@features/warehouses/interfaces';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { InputComponent } from '@shared/components/input-component/input-component';
import { SelectInputCustom } from '@shared/components/select-input-custom/select-input-custom';
import { selectInputCustom } from '@shared/components/select-input-custom/select-input-custom-input';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-update-warehouse-modal',
  imports: [
    ButtonIcon,
    InputComponent,
    SelectInputCustom,
    ButtonComponent,
    LucideAngularModule,
    ReactiveFormsModule,
  ],
  templateUrl: './update-warehouse-modal.html',
  styleUrl: './update-warehouse-modal.css',
})
export class UpdateWarehouseModal {
  isOpen = input.required<boolean>();
  closeClick = output<void>();
  warehouse = input.required<Warehouse>();

  private locationsService = inject(LocationsService);
  private locations = this.locationsService.selectLocations;
  protected locationsOptions = computed<selectInputCustom[]>(() => {
    return this.locations().map((location) => ({
      key: location.id,
      label: location.nombre,
    }));
  });

  protected warehouseService = inject(WarehouseService);
  protected toastService = inject(ToastService);
  protected icons = inject(IconService).icons;

  protected warehouseControl = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    locationId: new FormControl('', { nonNullable: true }),
    // active: new FormControl(true),
  });

  constructor() {
    effect(() => {
      const currentWarehouse = this.warehouse();
      this.warehouseControl.patchValue({
        name: currentWarehouse.name,
        locationId: currentWarehouse.locationId || '',
        // active: true,
      });
    });
  }

  private opened = effect(() => {
    if (this.isOpen()) this.locationsService.getSelectLocations();
  });

  closeModal() {
    this.closeClick.emit();
  }

  onSubmit(): void {
    // console.log(this.warehouseControl.value);
    this.warehouseControl.markAllAsTouched();
    if(this.warehouseControl.valid){
      this.warehouseService.updateWarehouse(
        this.warehouse().id,
        this.warehouseControl.value.name!,
        this.warehouseControl.value.locationId!,
        // this.warehouseControl.value.active!,
      ).subscribe((response: { success: boolean; message: string }) => {
        if (response.success) {
          this.toastService.show(response.message, 'success');
          this.closeModal();
        } else {
          this.toastService.show(response.message, 'error');
        }
      });
    }
  }
}

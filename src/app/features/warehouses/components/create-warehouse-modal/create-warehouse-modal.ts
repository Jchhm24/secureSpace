import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IconService } from '@core/services/icon-service';
import { LocationsService } from '@core/services/locations-service';
import { ToastService } from '@core/services/toast-service';
import { UserService } from '@core/services/user-service';
import { WarehouseService } from '@core/services/warehouse-service';
import { WarehouseCreateInterface } from '@features/warehouses/interfaces';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { InputComponent } from '@shared/components/input-component/input-component';
import { SelectInputCustom } from '@shared/components/select-input-custom/select-input-custom';
import { selectInputCustom } from '@shared/components/select-input-custom/select-input-custom-input';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-create-warehouse-modal',
  imports: [
    ButtonIcon,
    InputComponent,
    ReactiveFormsModule,
    SelectInputCustom,
    ButtonComponent,
    LucideAngularModule
  ],
  templateUrl: './create-warehouse-modal.html',
  styleUrl: './create-warehouse-modal.css',
})
export class CreateWarehouseModal {
  isOpen = input.required<boolean>();
  closeClick = output<void>();

  private locationsService = inject(LocationsService);
  private locations = this.locationsService.selectLocations;
  private userService = inject(UserService);
  private warehouseService = inject(WarehouseService);
  protected icons = inject(IconService).icons;

  private toastService = inject(ToastService);

  protected locationsOptions = computed<selectInputCustom[]>(() => {
    return this.locations().map((location) => ({
      key: location.id,
      label: location.nombre,
    }));
  });

  protected warehouseControl = new FormGroup({
    name: new FormControl(''),
    locationId: new FormControl(''),
    ownerId: new FormControl(this.userService.user()?.id),
  });

  constructor(private fb: FormBuilder) {
    this.warehouseControl = this.fb.group({
      name: ['', [Validators.required]],
      locationId: ['', [Validators.required]],
      ownerId: [this.userService.user()?.id, [Validators.required]],
    });
  }

  private opened = effect(() => {
    if (this.isOpen()) this.locationsService.getSelectLocations();
  });

  closeModal() {
    this.closeClick.emit();
  }

    onSubmit() {
    this.warehouseControl.markAllAsTouched();
    if (this.warehouseControl.valid) {
      this.warehouseService
        .createWarehouse(this.warehouseControl.value as WarehouseCreateInterface)
        .subscribe((success: {success: boolean, message: string}) => {
          if (success.success) {
            this.toastService.show(success.message, 'success');

            // set the form back to initial state
            this.warehouseControl.reset({
              name: '',
              locationId: '',
              ownerId: this.userService.user()?.id,
            });

            this.closeModal();
          } else {
            this.toastService.show(success.message, 'error');
          }
        });
    }
  }
}

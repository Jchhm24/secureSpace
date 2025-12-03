import { Component, effect, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconService } from '@core/services/icon-service';
import { LocationsService } from '@core/services/locations-service';
import { ToastService } from '@core/services/toast-service';
import { Location } from '@features/locations/interfaces';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { InputComponent } from '@shared/components/input-component/input-component';
import { SwitchInput } from '@shared/components/switch-input/switch-input';
import { LucideAngularModule } from 'lucide-angular';
import { useToggle } from '@shared/hooks/use-toggle';

@Component({
  selector: 'app-update-location-modal',
  imports: [
    ButtonComponent,
    ButtonIcon,
    InputComponent,
    LucideAngularModule,
    ReactiveFormsModule,
    SwitchInput,
  ],
  templateUrl: './update-location-modal.html',
  styleUrl: './update-location-modal.css',
})
export class UpdateLocationModal {
  isOpen = input.required<boolean>();
  closeClick = output<void>();
  location = input.required<Location>();

  private locationService = inject(LocationsService);
  private toastService = inject(ToastService);

  protected icons = inject(IconService).icons;
  protected enabled = useToggle(true);

  protected locationControl = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    active: new FormControl(false, { nonNullable: true }),
    id: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const currentLocation = this.location();

      this.locationControl.patchValue({
        name: currentLocation.location || '',
        active: currentLocation.active ?? false,
        id: currentLocation.id || '',
      });
    });
  }

  onSubmit(): void {
    this.locationControl.markAllAsTouched();
    if (this.locationControl.valid) {
      this.enabled.toggle();
      this.locationService
        .updateLocation(
          this.locationControl.value.name!,
          this.locationControl.value.active!,
          this.locationControl.value.id!,
        )
        .subscribe({
          next: (response: { success: boolean; message: string }) => {
            if (response.success) {
              this.toastService.show(response.message, 'success');
              this.closeModal();
            } else {
              this.toastService.show(response.message, 'error');
            }
            this.enabled.toggle();
          },
          error: () => {
            this.enabled.toggle();
          },
        });
    }
  }

  closeModal() {
    this.closeClick.emit();
  }
}

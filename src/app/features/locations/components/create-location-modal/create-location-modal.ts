import { Component, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconService } from '@core/services/icon-service';
import { LocationsService } from '@core/services/locations-service';
import { ToastService } from '@core/services/toast-service';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { InputComponent } from '@shared/components/input-component/input-component';
import { LucideAngularModule } from 'lucide-angular';

import { useToggle } from '@shared/hooks/use-toggle';

@Component({
  selector: 'app-create-location-modal',
  imports: [
    LucideAngularModule,
    InputComponent,
    ButtonComponent,
    ButtonIcon,
    ReactiveFormsModule,
  ],
  templateUrl: './create-location-modal.html',
  styleUrl: './create-location-modal.css',
})
export class CreateLocationModal {
  isOpen = input.required<boolean>();
  closeClick = output<void>();

  private locationsService = inject(LocationsService);
  private toast = inject(ToastService);
  protected icons = inject(IconService).icons;

  protected enabled = useToggle(true);

  protected locationControl = new FormGroup({
    name: new FormControl(''),
  });

  closeModal(): void {
    this.closeClick.emit();
  }

  onSubmit(): void {
    this.locationControl.markAllAsTouched();
    if (this.locationControl.valid) {
      this.enabled.toggle();
      this.locationsService
        .createLocation(this.locationControl.value.name!)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.toast.show(response.message, 'success');
              this.closeModal();
            } else {
              this.toast.show(response.message, 'error');
            }
            this.enabled.toggle();
          },
          error: () => {
            this.enabled.toggle();
          },
        });
    }
  }
}

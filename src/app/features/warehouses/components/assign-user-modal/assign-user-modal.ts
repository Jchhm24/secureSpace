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
import { PeopleService } from '@core/services/people-service';
import { WarehouseService } from '@core/services/warehouse-service';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { SelectInputCustom } from '@shared/components/select-input-custom/select-input-custom';
import { selectInputCustom } from '@shared/components/select-input-custom/select-input-custom-input';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-assign-user-modal',
  imports: [
    LucideAngularModule,
    ButtonIcon,
    SelectInputCustom,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './assign-user-modal.html',
  styleUrl: './assign-user-modal.css',
})
export class AssignUserModal {
  isOpen = input.required<boolean>();
  closeClick = output<void>();
  warehouseId = input.required<string>();

  private warehouseService = inject(WarehouseService);
  private peopleService = inject(PeopleService);
  private people = this.peopleService.selectPeople;
  protected icons = inject(IconService).icons;

  protected peopleOptions = computed<selectInputCustom[]>(() => {
    return this.people().map((person) => ({
      key: person.id,
      label: person.nombre,
    }));
  });

  protected assignUserControl = new FormGroup({
    personId: new FormControl(''),
  });

  private opened = effect(() => {
    if (this.isOpen()) this.peopleService.getSelectPeople();
  });

  closeModal() {
    this.closeClick.emit();
  }

  onSubmit() {
    this.assignUserControl.markAllAsTouched();
    if (this.assignUserControl.valid) {
      this.warehouseService
        .assignUserToWarehouse(
          this.warehouseId(),
          this.assignUserControl.value.personId!,
        )
        .subscribe((success: boolean) => {
          if(success){
            alert('Usuario asignado correctamente');
            this.closeModal();

            this.assignUserControl.reset();
          }else{
            alert('Error al asignar el usuario');
          }
        });
    }
  }
}

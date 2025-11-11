import { Component, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconService } from '@core/services/icon-service';
import { PeopleService } from '@core/services/people-service';
import { ToastService } from '@core/services/toast-service';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { InputComponent } from '@shared/components/input-component/input-component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-create-people-modal',
  imports: [LucideAngularModule, ButtonIcon, InputComponent,ButtonComponent ,ReactiveFormsModule],
  templateUrl: './create-people-modal.html',
  styleUrl: './create-people-modal.css',
})
export class CreatePeopleModal {
  isOpen = input.required<boolean>();
  closeClick = output<void>();

  private peopleService = inject(PeopleService);
  private toast = inject(ToastService);
  protected icons = inject(IconService).icons;

  protected personControl = new FormGroup({
    name: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
  });

  closeModal(): void {
    this.closeClick.emit();
  }

  onSubmit(): void {
    this.personControl.markAllAsTouched();
    if(this.personControl.valid){
      // check if password and confirmPassword are the same
      const {password, confirmPassword, ...personData} = this.personControl.value;
      if(password !== confirmPassword){
        this.toast.show('Las contraseñas no coinciden', 'error');
        return;
      }

      const newPerson = {
        name: personData.name as string,
        lastName: personData.lastName as string,
        email: personData.email as string,
        password: password as string,
      }

      this.peopleService.createPerson(newPerson).subscribe(
        (success: {success: boolean, message: string}) => {
          if(success.success){
            this.toast.show(success.message, 'success');

            this.personControl.reset();
            this.closeClick.emit();

          } else {
            this.toast.show(success.message, 'error');
          }
        })
    }
  }
}

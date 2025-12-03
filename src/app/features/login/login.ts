import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@core/services/auth-service';
import { IconService } from '@core/services/icon-service';
import { ToastService } from '@core/services/toast-service';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { InputComponent } from '@shared/components/input-component/input-component';
import { ToastContainer } from '@shared/components/toast-container/toast-container';
import { useToggle } from '@shared/hooks/use-toggle';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  imports: [
    InputComponent,
    ButtonComponent,
    ReactiveFormsModule,
    NgOptimizedImage,
    ToastContainer,
    LucideAngularModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  protected userControl = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });
  protected submitted = false;

  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  protected icons = inject(IconService).icons;
  protected enabled = useToggle(true);

  constructor(private fb: FormBuilder) {
    this.userControl = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.userControl.markAllAsTouched();
    if (this.userControl.valid) {
      this.submitted = true;
      this.enabled.toggle();
      this.authService
        .signIn(this.userControl.value.email!, this.userControl.value.password!)
        .subscribe({
          next: () => {
            this.toastService.show('Inicio de sesión exitoso', 'success');
            this.enabled.toggle();
          },
          error: (error) => {
            this.toastService.show(error.message, 'error');
            console.error('Sign in error:', error);
            this.enabled.toggle();
          },
          complete: () => {
            this.submitted = false;
          },
        });
    }
  }

  googleLogin() {
    this.authService.signInWithGoogle().subscribe({
      next: () => {
        this.toastService.show('Inicio de sesión exitoso', 'success');
      },
      error: (error) => {
        this.toastService.show(error.message, 'error');
        console.error('Sign in error:', error);
      },
    });
  }
}

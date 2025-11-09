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
import { ToastService } from '@core/services/toast-service';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { InputComponent } from '@shared/components/input-component/input-component';
import { ToastContainer } from '@shared/components/toast-container/toast-container';

@Component({
  selector: 'app-login',
  imports: [
    InputComponent,
    ButtonComponent,
    ReactiveFormsModule,
    NgOptimizedImage,
    ToastContainer
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

  constructor(
    private fb: FormBuilder,
  ) {
    this.userControl = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.userControl.markAllAsTouched();
    if (this.userControl.valid) {
      this.submitted = true;
      this.authService
        .signIn(this.userControl.value.email!, this.userControl.value.password!)
        .subscribe({
          next: () => {
            this.toastService.show('Inicio de sesión exitoso', 'success');
          },
          error: (error) => {
            this.toastService.show(error.message, 'error');
            console.error('Sign in error:', error);
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

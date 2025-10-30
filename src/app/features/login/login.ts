import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth-service';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { InputComponent } from '@shared/components/input-component/input-component';

@Component({
  selector: 'app-login',
  imports: [
    InputComponent,
    ButtonComponent,
    ReactiveFormsModule,
    NgOptimizedImage,
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
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
            this.router.navigate(['/warehouses']);
          },
          error: (error) => {
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
        this.router.navigate(['/warehouses']);
      },
      error: (error) => {
        console.error('Sign in error:', error);
      },
    });
  }
}

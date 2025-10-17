import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { InputComponent } from '@shared/components/input-component/input-component';

@Component({
  selector: 'app-login',
  imports: [InputComponent, ButtonComponent ,ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  userControl = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  })
  submitted = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.userControl = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    })
  }

  onSubmit() {
    this.submitted = true;

    this.userControl.markAllAsTouched();
    // If only form value isn't valid, the submit action is not performed
    if(this.userControl.valid){
      localStorage.setItem('isAuthenticated', 'true');
      this.router.navigate(['/warehouses']);
    }
  }

  googleLogin() {
    localStorage.setItem('isAuthenticated', 'true');
    this.router.navigate(['/warehouses']);
  }
}

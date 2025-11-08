import { Router } from '@angular/router';
import { UserService } from '@core/services/user-service';
import { inject } from '@angular/core';

export function redirectBasedOnRole(userService: UserService, router: Router): void {
  const userRole = userService.getUserRole();

  if (userRole === 'user') {
    router.navigate(['/my-warehouses']);
    return;
  }

  // Default to admin route
  router.navigate(['/warehouses']);
}

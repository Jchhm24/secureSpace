import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserService } from '@core/services/user-service';
import { Router } from '@angular/router';
import { redirectBasedOnRole } from '@shared/utils/helpers/redirect-to-based-on-role';

export const roleGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  // this roles set should come from route data the file defines the routes
  const requiredRoles = route.data['roles'] as Array<string>;

  const userRole = userService.getUserRole();

  if (requiredRoles && requiredRoles.includes(userRole)) {
    return true;
  }

  redirectBasedOnRole(userService, router);

  return false;
};

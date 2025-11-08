import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '@core/services/user-service';
import { redirectBasedOnRole } from '@shared/utils/helpers/redirect-to-based-on-role';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const userService = inject(UserService);

  if (isPlatformBrowser(platformId)) {
    const isAuthenticated = userService.isAuthenticated();

    if (isAuthenticated) {
      redirectBasedOnRole(userService, router);

      return false;
    }
  }

  return true;
};

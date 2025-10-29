import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const isAuthenticated = localStorage.getItem('token') !== null;

    if (isAuthenticated) {
      router.navigate(['/warehouses']);
      return false;
    }
  }

  return true;
};

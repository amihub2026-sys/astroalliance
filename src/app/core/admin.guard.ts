import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  // temporary check
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (isAdmin) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
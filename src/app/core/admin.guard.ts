import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {

  const router = inject(Router);

  if (typeof window !== 'undefined') {

    const isAdmin = localStorage.getItem('is_admin');

    if (isAdmin === 'true') {

      return true;
    }
  }

  return router.createUrlTree(['/admin-login']);
};
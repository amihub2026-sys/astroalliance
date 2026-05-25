import { inject } from '@angular/core';
import {
  CanActivateFn,
  CanActivateChildFn,
  Router
} from '@angular/router';

export const adminGuard: CanActivateFn & CanActivateChildFn = () => {
  const router = inject(Router);

  // IMPORTANT: during refresh SSR has no window
  // so don't redirect on server side
  if (typeof window === 'undefined') {
    return true;
  }

  const isAdmin = localStorage.getItem('is_admin');

  if (isAdmin === 'true') {
    return true;
  }

  return router.createUrlTree(['/admin-login']);
};
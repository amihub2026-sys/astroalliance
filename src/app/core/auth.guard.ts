import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  try {
    const rawUser = localStorage.getItem('matrimony_user');
    const appUserId = localStorage.getItem('app_user_id');

    const hasLoggedInUser = !!rawUser || !!appUserId;

    if (hasLoggedInUser) {
      return true;
    }

    router.navigate(['/login']);
    return false;
  } catch {
    router.navigate(['/login']);
    return false;
  }
};
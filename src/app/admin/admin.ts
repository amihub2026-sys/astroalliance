import { CommonModule } from '@angular/common';

import { Component } from '@angular/core';

import {
  RouterOutlet,
  RouterModule,
  Router
} from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,

  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule
  ],

  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})

export class Admin {

  sidebarOpen = false;

  adminName = 'Admin';

  constructor(private router: Router) {
    if (typeof window !== 'undefined') {
      this.adminName = localStorage.getItem('admin_name') || 'Admin';
    }
  }

  get currentLang(): 'en' | 'ta' {
    if (typeof window === 'undefined') {
      return 'en';
    }

    return (localStorage.getItem('tm_language') as 'en' | 'ta') || 'en';
  }

  changeLanguage(lang: 'en' | 'ta'): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem('tm_language', lang);
    window.dispatchEvent(new Event('storage'));
  }

  toggleSidebar(event?: Event): void {

    if (event) {
      event.stopPropagation();
    }

    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {

    setTimeout(() => {

      this.sidebarOpen = false;

    }, 100);

  }
logoutAdmin(): void {
  localStorage.removeItem('is_admin');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_name');

  this.router.navigate(['/admin-login']);
}
}
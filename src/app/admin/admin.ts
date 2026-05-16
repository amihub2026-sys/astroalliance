import { CommonModule } from '@angular/common';

import { Component } from '@angular/core';

import {
  RouterOutlet,
  RouterModule
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

}
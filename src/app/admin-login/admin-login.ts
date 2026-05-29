import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from '../core/supabase.client';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss'
})
export class AdminLogin implements OnInit {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const isAdmin = localStorage.getItem('is_admin');

    if (isAdmin === 'true') {
      this.router.navigateByUrl('/admin/dashboard');
    }
  }

  async onAdminLogin() {
    if (!this.email || !this.password) {
      alert('Enter email and password');
      return;
    }

    this.isLoading = true;

    const { data, error } = await supabase
      .from('admin_users')
      .select('admin_id, admin_name, email, role, is_active')
      .eq('email', this.email.trim())
      .eq('password', this.password)
      .eq('is_active', true)
      .in('role', ['admin', 'super_admin'])
      .single();

    this.isLoading = false;

    if (error || !data) {
      alert('Invalid admin login');
      return;
    }

    localStorage.setItem('is_admin', 'true');
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('admin_id', data.admin_id);
    localStorage.setItem('admin_name', data.admin_name || '');
    localStorage.setItem('admin_role', data.role || 'admin');

    this.ngZone.run(() => {
      this.router.navigateByUrl('/admin/dashboard');
    });
  }
}
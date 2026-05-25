import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
export class AdminLogin {
  phone = '';
  dob = '';
  isLoading = false;

  constructor(private router: Router) {}

  async onAdminLogin() {
    if (!this.phone || !this.dob) {
      alert('Enter phone number and DOB');
      return;
    }

    this.isLoading = true;

    const { data, error } = await supabase
      .from('admin_users')
      .select('admin_id, admin_name, phone_number, dob, role, is_active')
      .eq('phone_number', this.phone)
      .eq('dob', this.dob)
      .eq('is_active', true)
      .in('role', ['admin', 'super_admin'])
      .single();

    this.isLoading = false;

    if (error || !data) {
      alert('Invalid admin login');
      return;
    }

    localStorage.setItem('is_admin', 'true');
    localStorage.setItem('admin_id', data.admin_id);
    localStorage.setItem('admin_name', data.admin_name || '');
    localStorage.setItem('admin_role', data.role || 'admin');

   this.router.navigateByUrl('/admin/dashboard');
  }
}
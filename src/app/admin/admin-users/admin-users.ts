import { Component, OnInit, ChangeDetectorRef } from '@angular/core';import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.scss']
})
export class AdminUsers implements OnInit {

  admins: any[] = [];

  admin_name = '';
  phone_number = '';
  dob = '';
role = 'admin';

constructor(private cd: ChangeDetectorRef) {}
  async ngOnInit() {
    this.loadAdmins();
  }

  async loadAdmins() {

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

   if (!error && data) {
  this.admins = data;
  this.cd.detectChanges();
}
  }

  async addAdmin() {

    if (!this.admin_name || !this.phone_number || !this.dob) {
      return;
    }

    const { error } = await supabase
      .from('admin_users')
      .insert([
        {
          admin_name: this.admin_name,
          phone_number: this.phone_number,
          dob: this.dob,
          role: this.role
        }
      ]);

    if (!error) {

      this.admin_name = '';
      this.phone_number = '';
      this.dob = '';
      this.role = 'admin';

await this.loadAdmins();
this.cd.detectChanges();    }
  }

  async deleteAdmin(id: string) {

    await supabase
      .from('admin_users')
      .delete()
      .eq('admin_id', id);

await this.loadAdmins();
this.cd.detectChanges();  }
}

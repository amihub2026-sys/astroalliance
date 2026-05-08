import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type AdminSection =
  | 'dashboard'
  | 'profiles'
  | 'plans'
  | 'subscriptions'
  | 'payments'
  | 'settings';

interface AdminUser {
  id: number;
  profileId: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  plan: string;
  status: string;
  joinedDate: string;
}

interface AdminPlan {
  id: number;
  name: string;
  price: number;
  duration: string;
  contacts: number;
  colorClass: string;
}

interface AdminSubscription {
  id: number;
  user: string;
  profileId: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface AdminPayment {
  id: string;
  user: string;
  plan: string;
  amount: number;
  date: string;
  status: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class Admin {
  activeSection: AdminSection = 'dashboard';
  sidebarOpen = false;
  searchTerm = '';

  stats = {
    totalUsers: 245,
    totalProfiles: 210,
    premiumUsers: 64,
    activeSubscriptions: 51,
    pendingPayments: 8,
    blockedUsers: 3
  };

  users: AdminUser[] = [
    {
      id: 1,
      profileId: 'TM001',
      name: 'Arun Kumar',
      age: 29,
      gender: 'Male',
      city: 'Chennai',
      plan: 'Premium',
      status: 'Active',
      joinedDate: '2026-04-01'
    },
    {
      id: 2,
      profileId: 'TM002',
      name: 'Divya',
      age: 25,
      gender: 'Female',
      city: 'Madurai',
      plan: 'Classic',
      status: 'Pending',
      joinedDate: '2026-04-02'
    },
    {
      id: 3,
      profileId: 'TM003',
      name: 'Karthik',
      age: 31,
      gender: 'Male',
      city: 'Coimbatore',
      plan: 'Gold',
      status: 'Active',
      joinedDate: '2026-04-03'
    },
    {
      id: 4,
      profileId: 'TM004',
      name: 'Meena',
      age: 27,
      gender: 'Female',
      city: 'Salem',
      plan: 'Free',
      status: 'Blocked',
      joinedDate: '2026-04-04'
    },
    {
      id: 5,
      profileId: 'TM005',
      name: 'Sathish',
      age: 30,
      gender: 'Male',
      city: 'Trichy',
      plan: 'Premium',
      status: 'Active',
      joinedDate: '2026-04-05'
    }
  ];

  plans: AdminPlan[] = [
    {
      id: 1,
      name: 'Free',
      price: 0,
      duration: '30 Days',
      contacts: 0,
      colorClass: 'free'
    },
    {
      id: 2,
      name: 'Classic',
      price: 499,
      duration: '30 Days',
      contacts: 20,
      colorClass: 'classic'
    },
    {
      id: 3,
      name: 'Gold',
      price: 999,
      duration: '60 Days',
      contacts: 50,
      colorClass: 'gold'
    },
    {
      id: 4,
      name: 'Premium',
      price: 1499,
      duration: '90 Days',
      contacts: 100,
      colorClass: 'premium'
    }
  ];

  subscriptions: AdminSubscription[] = [
    {
      id: 1,
      user: 'Arun Kumar',
      profileId: 'TM001',
      plan: 'Premium',
      startDate: '2026-04-01',
      endDate: '2026-06-30',
      status: 'Active'
    },
    {
      id: 2,
      user: 'Divya',
      profileId: 'TM002',
      plan: 'Classic',
      startDate: '2026-04-02',
      endDate: '2026-05-02',
      status: 'Expired'
    },
    {
      id: 3,
      user: 'Karthik',
      profileId: 'TM003',
      plan: 'Gold',
      startDate: '2026-04-03',
      endDate: '2026-06-03',
      status: 'Active'
    }
  ];

  payments: AdminPayment[] = [
    {
      id: 'PAY001',
      user: 'Arun Kumar',
      plan: 'Premium',
      amount: 1499,
      date: '2026-04-01',
      status: 'Paid'
    },
    {
      id: 'PAY002',
      user: 'Divya',
      plan: 'Classic',
      amount: 499,
      date: '2026-04-02',
      status: 'Pending'
    },
    {
      id: 'PAY003',
      user: 'Karthik',
      plan: 'Gold',
      amount: 999,
      date: '2026-04-03',
      status: 'Paid'
    }
  ];

  settings = {
    siteName: 'ASTRO ALLIANCE',
    supportEmail: 'support@thirumagalmatrimony.in',
    supportPhone: '+91 9876543210',
    maintenanceMode: false
  };

  get filteredUsers(): AdminUser[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) return this.users;

    return this.users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.profileId.toLowerCase().includes(term) ||
      user.city.toLowerCase().includes(term) ||
      user.plan.toLowerCase().includes(term) ||
      user.status.toLowerCase().includes(term)
    );
  }

  setSection(section: AdminSection): void {
    this.activeSection = section;
    this.sidebarOpen = false;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  getStatusClass(status: string): string {
    const value = status.toLowerCase();

    if (value === 'active' || value === 'paid') return 'status active';
    if (value === 'pending') return 'status pending';
    if (value === 'blocked') return 'status blocked';
    if (value === 'expired') return 'status expired';

    return 'status';
  }

  approveUser(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = 'Active';
      this.recalculateStats();
    }
  }

  blockUser(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = 'Blocked';
      this.recalculateStats();
    }
  }

  deleteUser(userId: number): void {
    this.users = this.users.filter(user => user.id !== userId);
    this.recalculateStats();
  }

  saveSettings(): void {
    alert('Settings saved successfully');
  }

  recalculateStats(): void {
    this.stats.totalUsers = this.users.length;
    this.stats.totalProfiles = this.users.length;
    this.stats.premiumUsers = this.users.filter(
      user => user.plan.toLowerCase() === 'premium'
    ).length;
    this.stats.blockedUsers = this.users.filter(
      user => user.status.toLowerCase() === 'blocked'
    ).length;
    this.stats.activeSubscriptions = this.subscriptions.filter(
      sub => sub.status.toLowerCase() === 'active'
    ).length;
    this.stats.pendingPayments = this.payments.filter(
      payment => payment.status.toLowerCase() === 'pending'
    ).length;
  }
}
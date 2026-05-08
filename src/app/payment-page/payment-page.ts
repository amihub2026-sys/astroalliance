import { Component, inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from '../core/supabase.client';
import { SnackbarService } from '../shared/snackbar.service';
interface DbPlanRow {
  plan_id: string;
  plan_code?: string | null;
  plan_name: string;
  duration_months?: number | null;
  contact_limit?: number | null;
  is_active?: boolean | null;
  price?: number | null;
  currency_code?: string | null;
}

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-page.html',
  styleUrls: ['./payment-page.scss']
})
export class PaymentPage implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  cdr = inject(ChangeDetectorRef);
snackbar = inject(SnackbarService);
  isBrowser = isPlatformBrowser(this.platformId);

 planName = '';
planCode = '';
planPrice = '';
  planDuration = '';
  profileId = '';
  profileName = '';
  fromPage = '';

  isPaying = false;
  paymentSuccess = false;

  dbPlans: DbPlanRow[] = [];

  ngOnInit(): void {
   this.planName = this.route.snapshot.queryParamMap.get('planName') || '';
this.planCode = this.route.snapshot.queryParamMap.get('planCode') || '';
this.planPrice = this.route.snapshot.queryParamMap.get('planPrice') || '';
    this.planDuration = this.route.snapshot.queryParamMap.get('planDuration') || '';
    this.profileId = this.route.snapshot.queryParamMap.get('profileId') || '';
    this.profileName = this.route.snapshot.queryParamMap.get('profileName') || '';
    this.fromPage = this.route.snapshot.queryParamMap.get('from') || '';

    this.loadDbPlans();
  }

  private getLoggedInUserId(): string | null {
    if (!this.isBrowser) return null;

    try {
      const rawUser = localStorage.getItem('matrimony_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
if (parsed?.user_id) {
  console.log('APP USER ID:', parsed.user_id);
  return String(parsed.user_id);
}      }
    } catch (error) {
      console.error('Error reading matrimony_user:', error);
    }

    const stored = localStorage.getItem('app_user_id');
    return stored ? String(stored) : null;
  }

  private normalize(value: string | null | undefined): string {
    return String(value || '').trim().toLowerCase();
  }

  async loadDbPlans(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('mst_plans')
        .select(`
          plan_id,
          plan_code,
          plan_name,
          duration_months,
          contact_limit,
          is_active,
          price,
          currency_code
        `)
        .order('price', { ascending: true });

      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];
      this.dbPlans = rows.filter((row: any) => row?.is_active === true);
    } catch (error) {
      console.error('Load DB plans error:', error);
      this.dbPlans = [];
    }
  }

 private getDbPlanByName(planName: string): DbPlanRow | undefined {
  const normalizedName = this.normalize(planName);
  const normalizedCode = this.normalize(this.planCode);

  return this.dbPlans.find((p) => {
    const dbName = this.normalize(p.plan_name);
    const dbCode = this.normalize(p.plan_code);

    return (
      dbCode === normalizedCode ||
      dbName === normalizedName
    );
  });
}

  getPlanLimit(planName: string): number {
    const dbPlan = this.getDbPlanByName(planName);
    if (dbPlan?.contact_limit != null) {
      return Number(dbPlan.contact_limit);
    }

    switch (planName) {
      case 'ASTRO ALLIANCE':
        return 20;
      case 'TM Classic':
        return 50;
      case 'TM Premium':
        return 80;
      case 'TM Elite':
        return 120;
      default:
        return 20;
    }
  }

  getPlanDays(planName: string): number {
    const dbPlan = this.getDbPlanByName(planName);
    if (dbPlan?.duration_months != null) {
      return Number(dbPlan.duration_months) * 30;
    }

    switch (planName) {
      case 'ASTRO ALLIANCE':
        return 90;
      case 'TM Classic':
        return 180;
      case 'TM Premium':
        return 270;
      case 'TM Elite':
        return 365;
      default:
        return 90;
    }
  }

  private addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  async payNow(): Promise<void> {
    if (this.isPaying) return;

    const userId = this.getLoggedInUserId();

    if (!userId) {
      this.snackbar.error('Please login first');
      this.router.navigate(['/login'], {
        queryParams: {
          from: 'payment',
          profileId: this.profileId,
          profileName: this.profileName
        }
      });
      return;
    }
const { data: appUser, error: appUserError } = await supabase
  .from('app_users')
  .select('user_id')
  .eq('user_id', userId)
  .maybeSingle();

if (appUserError) {
  this.snackbar.error(appUserError.message);
  return;
}

if (!appUser) {
  this.snackbar.error('User account not found. Please logout and login again.');
  return;
}
    const dbPlan = this.getDbPlanByName(this.planName);

    if (!dbPlan?.plan_id) {
      this.snackbar.error(`Plan not found in database: ${this.planName}`);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const endDate = this.addDays(today, this.getPlanDays(this.planName));
    const contactLimit = this.getPlanLimit(this.planName);

    this.isPaying = true;
    this.cdr.detectChanges();

    try {
      const { data: existingSubscriptions, error: existingError } = await supabase
        .from('user_subscriptions')
        .select(`
          subscription_id,
          is_active
        `)
        .eq('user_id', userId);

      if (existingError) throw existingError;

      const activeIds = (existingSubscriptions || [])
        .filter((s: any) => s?.is_active === true)
        .map((s: any) => s.subscription_id)
        .filter(Boolean);

      if (activeIds.length > 0) {
        const { error: deactivateError } = await supabase
          .from('user_subscriptions')
          .update({
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .in('subscription_id', activeIds);

        if (deactivateError) throw deactivateError;
      }

      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert([
          {
            user_id: userId,
            plan_id: dbPlan.plan_id,
            subscription_status_id: null,
            start_date: today,
            end_date: endDate,
            contacts_used: 0,
            total_contacts_allowed: contactLimit,
            is_active: true
          }
        ]);

      if (insertError) throw insertError;

      this.paymentSuccess = true;
this.isPaying = false;

this.snackbar.success('Payment completed successfully');

this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Payment error:', error);
     this.snackbar.error(error?.message || 'Payment failed');
      this.isPaying = false;
      this.cdr.detectChanges();
    }
  }

  goBack(): void {
    if (this.isPaying) return;

    this.router.navigate(['/plans'], {
      queryParams: {
        from: this.fromPage || '',
        profileId: this.profileId || '',
        profileName: this.profileName || ''
      }
    });
  }

  goToProfile(): void {
    this.router.navigate(['/profile-view'], {
      queryParams: {
        unlocked: 'true',
        profileId: this.profileId || 'AMI101',
        profileName: this.profileName || 'Anand Kumar',
        selectedPlan: this.planName || 'TM Classic'
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
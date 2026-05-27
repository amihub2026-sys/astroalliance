import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from '../../core/supabase.client';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-plans',
  standalone: true,
 imports: [CommonModule, FormsModule],
  templateUrl: './user-plans.html',
  styleUrls: ['./user-plans.scss']
})
export class UserPlans implements OnInit {

  

  profileId = '';
  profileCode = '';
  userId = '';

  plans: any[] = [];
  isLoading = false;
  isAssigning = false;
paymentMode = 'Cash';
selectedPlan: any = null;
showPaymentPopup = false;

paymentModes = [
  'Cash',
  'Razorpay',
  'Cheque',
  'UPI',
  'Bank Transfer'
];
constructor(
  private route: ActivatedRoute,
  public router: Router,
  private ngZone: NgZone,
  private cd: ChangeDetectorRef
) {}

  async ngOnInit(): Promise<void> {
    this.profileId = this.route.snapshot.queryParamMap.get('profile_id') || '';
    this.profileCode = this.route.snapshot.queryParamMap.get('profile_code') || '';

    await this.loadPlans();
    await this.loadProfileUserId();
  }

async loadPlans(): Promise<void> {
  this.ngZone.run(() => {
    this.isLoading = true;
    this.plans = [];
    this.cd.detectChanges();
  });

  const { data, error } = await supabase
    .from('mst_plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    
    alert(error.message);

    this.ngZone.run(() => {
      this.isLoading = false;
      this.cd.detectChanges();
    });

    return;
  }

  this.ngZone.run(() => {
    this.plans = (data || []).filter((p: any) => p.is_active === true);
    this.isLoading = false;
    this.cd.detectChanges();
  });
}
async loadProfileUserId(): Promise<void> {

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('profile_id', this.profileId)
    .maybeSingle();



  if (error) {
   
    return;
  }

  this.userId = data?.user_id || '';

 
}
askPaymentMode(plan: any): void {
  this.selectedPlan = plan;
  this.paymentMode = 'Cash';
  this.showPaymentPopup = true;
}

closePaymentPopup(): void {
  this.showPaymentPopup = false;
  this.selectedPlan = null;
}

confirmPaymentMode(): void {
  if (!this.selectedPlan) {
    return;
  }

  this.showPaymentPopup = false;
  this.assignPlan(this.selectedPlan);
}
  async assignPlan(plan: any): Promise<void> {
   if (!this.profileId) {
  alert('Profile id missing');
  return;
}

    if (this.isAssigning) return;

    this.isAssigning = true;

    const startDate = new Date();
    const endDate = new Date();

    endDate.setMonth(
      endDate.getMonth() + Number(plan.duration_months || 1)
    );

const { error } = await supabase
  .from('user_subscriptions')
  .insert({

    user_id: this.userId,

    profile_id: this.profileId,

    plan_id: plan.plan_id,

    start_date:
      startDate.toISOString().slice(0, 10),

    end_date:
      endDate.toISOString().slice(0, 10),

    total_contacts_allowed:
      plan.contact_limit || 0,

    contacts_used: 0,

    is_active: true,

    payment_mode: this.paymentMode

  });

    this.isAssigning = false;

    if (error) {
      
      alert(error.message);
      return;
    }

    alert('Package assigned successfully');
    this.router.navigate(['/admin/profiles']);
  }
}
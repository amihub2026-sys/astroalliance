import {
  Component,
  OnInit,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './plans.html',
  styleUrls: ['./plans.scss']
})
export class Plans implements OnInit {

  isLoading = true;

  plans: any[] = [];

  showPlanModal = false;

editingPlan: any = null;

planForm = {
  plan_name: '',
  price: '',
  duration_months: '',
  contact_limit: '',
  profile_view_limit: '',
 
  is_active: true
};

constructor(
  private ngZone: NgZone,
  private cd: ChangeDetectorRef
) {}

  get currentLang(): 'en' | 'ta' {
  if (typeof window === 'undefined') {
    return 'en';
  }

  return (localStorage.getItem('tm_language') as 'en' | 'ta') || 'en';
}

txt(en: string, ta: string): string {
  return this.currentLang === 'ta' ? ta : en;
}

  async ngOnInit(): Promise<void> {
    await this.loadPlans();
  }

  async loadPlans(): Promise<void> {

    this.isLoading = true;

    const { data, error } = await supabase
      .from('mst_plans')
      .select('*')
      .order('price', { ascending: true });

    // if (error) {
    //   console.error('Plans error:', error);
    //   this.plans = [];
    // } else {
    //   this.plans = data || [];
    // }

    // this.isLoading = false;
    this.ngZone.run(() => {

  if (error) {

    console.error('Plans error:', error);

    this.plans = [];

  } else {

    this.plans = data || [];

  }

  this.isLoading = false;

  this.cd.detectChanges();

});
  }
  
  async togglePlan(plan: any): Promise<void> {
console.log('PLAN BEFORE:', plan.is_active);
    const { error } = await supabase
      .from('mst_plans')
      .update({
        is_active: !plan.is_active
      })
      .eq('plan_id', plan.plan_id);

   if (error) {

  console.error('Toggle error:', error);

  alert(
    this.currentLang === 'ta'
      ? 'திட்டத்தை மாற்ற முடியவில்லை'
      : 'Failed to change plan status'
  );

  return;
}

console.log('PLAN UPDATED');

alert(
  !plan.is_active
    ? this.txt('Plan Enabled', 'திட்டம் இயக்கப்பட்டது')
    : this.txt('Plan Disabled', 'திட்டம் முடக்கப்பட்டது')
);
    await this.loadPlans();
  }
openAddPlan(): void {

  this.editingPlan = null;

  this.planForm = {
    plan_name: '',
    price: '',
    duration_months: '',
    contact_limit: '',
    profile_view_limit: '',
   
    is_active: true
  };

  this.showPlanModal = true;
}

editPlan(plan: any): void {

  this.editingPlan = plan;

  this.planForm = {
    plan_name: plan.plan_name || '',
    price: plan.price || '',
    duration_months: plan.duration_months || '',
    contact_limit: plan.contact_limit || '',
    profile_view_limit: plan.profile_view_limit || '',

    is_active: plan.is_active
  };

  this.showPlanModal = true;
}
async savePlan(): Promise<void> {

  if (this.isLoading) {
  return;
}

this.isLoading = true;

  if (
  !this.planForm.plan_name ||
  
  !this.planForm.price
) {

  alert(
    this.currentLang === 'ta'
      ? 'தேவையான விவரங்களை நிரப்பவும்'
      : 'Please fill required fields'
  );
this.isLoading = false;
  return;
}
const formattedCode = this.editingPlan
  ? this.editingPlan.plan_code
  : 'TM_' +
      this.planForm.plan_name
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_');

  const payload = {
  plan_code: formattedCode,
    plan_name: this.planForm.plan_name,
    duration_months: Number(this.planForm.duration_months),
    contact_limit: Number(this.planForm.contact_limit),
    profile_view_limit: Number(this.planForm.profile_view_limit),
    price: Number(this.planForm.price),
    currency_code: 'INR',
    is_active: this.planForm.is_active
  };

  // UPDATE
  if (this.editingPlan) {

    const { error } = await supabase
      .from('mst_plans')
      .update(payload)
      .eq('plan_id', this.editingPlan.plan_id);

 if (error) {

 console.error('FULL ERROR:', error);

alert(error.message);

  alert(
    this.currentLang === 'ta'
      ? 'திட்டத்தை சேமிக்க முடியவில்லை'
      : 'Failed to save plan'
  );
  this.isLoading = false;

  return;
}

  }

  // INSERT
  else {

    const { error } = await supabase
      .from('mst_plans')
      .insert(payload);

  if (error) {

 console.error('FULL ERROR:', error);

alert(error.message);

  alert(
    this.currentLang === 'ta'
      ? 'திட்டத்தை சேமிக்க முடியவில்லை'
      : 'Failed to save plan'
  );
this.isLoading = false;
  return;
}

  }
alert(
  this.currentLang === 'ta'
    ? 'திட்டம் வெற்றிகரமாக சேமிக்கப்பட்டது'
    : 'Plan saved successfully'
);
  this.showPlanModal = false;
await this.loadPlans();

this.ngZone.run(() => {

  this.isLoading = false;

  this.cd.detectChanges();

});
}

}
import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export type FlowMode = 'NORMAL' | 'BIODATA_EDIT';

@Injectable({
  providedIn: 'root'
})
export class UserFlowService {

  private storageKey = 'user_flow_state';

  private state = {
    mode: 'NORMAL' as FlowMode,
    user_id: '',
    gender: '',
    biodata_completed: false,
    payment_done: false,
    admin_approved: false,
    plan_active: false,
    profile_status: '',
    active_plan_code: '',
    contacts_used: 0,
    total_contacts_allowed: 0
  };

  private isBrowser(): boolean {
    return typeof window !== 'undefined' &&
           typeof localStorage !== 'undefined';
  }

  getState() {
    return this.state;
  }

  setState(data: Partial<typeof this.state>) {
    this.state = {
      ...this.state,
      ...data
    };

    this.saveToStorage();
  }

  setMode(mode: FlowMode) {
    this.state.mode = mode;
    this.saveToStorage();
  }

  isBiodataCompleted(): boolean {
    return this.state.biodata_completed;
  }

  isPaymentDone(): boolean {
    return this.state.payment_done;
  }

  isAdminApproved(): boolean {
    return this.state.admin_approved;
  }

  isEditMode(): boolean {
    return this.state.mode === 'BIODATA_EDIT';
  }

  isMale(): boolean {
    const gender = String(this.state.gender || '').toLowerCase();
    return gender === 'male' || gender === 'ஆண்';
  }

  isFemale(): boolean {
    const gender = String(this.state.gender || '').toLowerCase();
    return gender === 'female' || gender === 'பெண்';
  }

  hasPlanLimit(): boolean {
    return Number(this.state.total_contacts_allowed || 0) > 0;
  }

  isPlanCountOver(): boolean {
    return (
      Number(this.state.total_contacts_allowed || 0) > 0 &&
      Number(this.state.contacts_used || 0) >=
      Number(this.state.total_contacts_allowed || 0)
    );
  }

  async syncFromServer(): Promise<typeof this.state> {
    const userId = this.getCurrentUserId();

    if (!userId) {
      this.resetFlow();
      return this.state;
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('profile_id, user_id, gender_text, biodata_completed, profile_status')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: plan } = await supabase
      .from('user_subscriptions')
      .select('plan_code, is_active, contacts_used, total_contacts_allowed')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    const status = String(profile?.profile_status || '').toLowerCase();

    this.state = {
      ...this.state,
      mode: this.state.mode,
      user_id: userId,
      gender: profile?.gender_text || '',
      biodata_completed: !!profile?.biodata_completed,
      payment_done: !!plan,
      admin_approved: status === 'approved',
      plan_active: !!plan?.is_active,
      profile_status: profile?.profile_status || '',
      active_plan_code: plan?.plan_code || '',
      contacts_used: Number(plan?.contacts_used || 0),
      total_contacts_allowed: Number(plan?.total_contacts_allowed || 0)
    };

    this.saveToStorage();
    return this.state;
  }

  private getCurrentUserId(): string {
    if (!this.isBrowser()) return '';

    try {
      const rawUser = localStorage.getItem('matrimony_user');
      const user = rawUser ? JSON.parse(rawUser) : null;

      return (
        user?.user_id ||
        localStorage.getItem('app_user_id') ||
        ''
      );
    } catch {
      return localStorage.getItem('app_user_id') || '';
    }
  }

  resetFlow() {
    this.state = {
      mode: 'NORMAL',
      user_id: '',
      gender: '',
      biodata_completed: false,
      payment_done: false,
      admin_approved: false,
      plan_active: false,
      profile_status: '',
      active_plan_code: '',
      contacts_used: 0,
      total_contacts_allowed: 0
    };

    this.saveToStorage();
  }

  private saveToStorage() {
    if (!this.isBrowser()) return;

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.state)
    );
  }

  private loadFromStorage() {
    if (!this.isBrowser()) return;

    const data = localStorage.getItem(this.storageKey);

    if (data) {
      try {
        this.state = {
          ...this.state,
          ...JSON.parse(data)
        };
      } catch {
        console.log('Flow state parse error');
      }
    }
  }

  constructor() {
    this.loadFromStorage();
  }
}
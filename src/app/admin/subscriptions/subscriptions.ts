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
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions.html',
  styleUrls: ['./subscriptions.scss']
})
export class Subscriptions implements OnInit {
  isLoading = true;
  searchTerm = '';
  subscriptions: any[] = [];
  currentPage = 1;

itemsPerPage = 5;

constructor(
  private ngZone: NgZone,
  private cd: ChangeDetectorRef
) {}

get currentLang(): 'en' | 'ta' {

  if (typeof window === 'undefined') {

    return 'en';

  }

  return (
    localStorage.getItem('tm_language') as 'en' | 'ta'
  ) || 'en';

}

txt(en: string, ta: string): string {

  return this.currentLang === 'ta'
    ? ta
    : en;

}

  async ngOnInit(): Promise<void> {
    await this.loadSubscriptions();
  }

async loadSubscriptions(): Promise<void> {
  try {

    this.isLoading = true;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        mst_plans (
          plan_name,
          plan_code,
          price,
          duration_months,
          profile_view_limit
        ),
       user_profiles (
  profile_code,
  full_name,
  full_name_ta
)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      this.subscriptions = [];
    } else {
      this.subscriptions = data || [];
    }

  } catch (e) {

    console.error(e);
    this.subscriptions = [];

  } finally {

    this.isLoading = false;
    this.cd.detectChanges();

  }
}
get totalPages(): number {

  return Math.ceil(
    this.filteredSubscriptions.length / this.itemsPerPage
  );

}

get paginatedSubscriptions(): any[] {

  const start =
    (this.currentPage - 1) * this.itemsPerPage;

  return this.filteredSubscriptions.slice(
    start,
    start + this.itemsPerPage
  );

}

nextPage(): void {

  if (this.currentPage < this.totalPages) {

    this.currentPage++;

  }

}

prevPage(): void {

  if (this.currentPage > 1) {

    this.currentPage--;

  }

}
  get filteredSubscriptions(): any[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) return this.subscriptions;

    return this.subscriptions.filter(item =>
    
String(item.profile_code || item.user_profiles?.profile_code || '').toLowerCase().includes(term) ||
String(item.payment_mode || '').toLowerCase().includes(term) ||
      String(item.mst_plans?.plan_name || '').toLowerCase().includes(term) ||
    String(item.user_profiles?.full_name || '').toLowerCase().includes(term) ||
String(item.user_profiles?.full_name_ta || '').toLowerCase().includes(term)
    );
  }

  async toggleSubscription(item: any): Promise<void> {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        is_active: !item.is_active
      })
      .eq('subscription_id', item.subscription_id);

    if (error) {
    
      return;
    }

    await this.loadSubscriptions();


  this.cd.detectChanges();

  }

  async refresh(): Promise<void> {
    await this.loadSubscriptions();
  }
}
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {

  isLoading = true;

  stats = {
    totalProfiles: 0,
    maleProfiles: 0,
    femaleProfiles: 0,
    activeSubscriptions: 0
  };

  recentProfiles: any[] = [];
constructor(
  private cd: ChangeDetectorRef,
  private ngZone: NgZone
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

v(en: any, ta: any): string {
  if (this.currentLang === 'ta') {
    return ta || en || '-';
  }

  return en || '-';
}

genderText(value: string): string {

  if (this.currentLang === 'en') {
    return value || '-';
  }

  const map: any = {
    Male: 'ஆண்',
    Female: 'பெண்',
    Other: 'மற்றவை'
  };

  return map[value] || value || '-';
}
cityText(value: string): string {

  if (this.currentLang === 'en') {
    return value || '-';
  }

  const map: any = {
    Madurai: 'மதுரை',
    Chennai: 'சென்னை',
    Coimbatore: 'கோயம்புத்தூர்',
    Salem: 'சேலம்',
    Trichy: 'திருச்சி',
    'Abu Dhabi': 'அபுதாபி'
  };

  return map[value] || value || '-';
}
  async ngOnInit(): Promise<void> {
    await this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.isLoading = true;

    try {
      const { count: totalProfiles } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: maleProfiles } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('gender_text', 'Male');

      const { count: femaleProfiles } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('gender_text', 'Female');

      const { count: activeSubscriptions } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { data: recentProfiles, error } = await supabase
        .from('user_profiles')
.select(`
  profile_id,
  profile_code,
  full_name,
  full_name_ta,
  gender_text,
  city_text,
  created_at
`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
    
      }

    this.ngZone.run(() => {

  this.stats = {
    totalProfiles: totalProfiles || 0,
    maleProfiles: maleProfiles || 0,
    femaleProfiles: femaleProfiles || 0,
    activeSubscriptions: activeSubscriptions || 0
  };

  this.recentProfiles = recentProfiles || [];

  this.isLoading = false;

  this.cd.detectChanges();

});

    } catch (error) {
      
    }
  }

}
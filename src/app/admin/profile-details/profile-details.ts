import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { supabase } from '../../core/supabase.client';


@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-details.html',
  styleUrls: ['./profile-details.scss']
})
export class ProfileDetails implements OnInit, OnChanges {
  @Input() id = '';

  isLoading = true;
  profile: any = null;
//  pdfWithPhoto = false;
// pdfWithAddress = true;
showPrintOptions = false;
activeTab: 'profile' | 'other' = 'profile';
// pdfPhotoUrl = '/assets/default-avatar.png';
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
masterText(en: any, ta: any): string {
  if (this.currentLang !== 'ta') {
    return en || '-';
  }

  if (ta) {
    return ta;
  }

  const map: any = {
    Dindigul: 'திண்டுக்கல்',
    Hindu: 'இந்து',
    Viswakarma: 'விஸ்வகர்மா',
    'First Marriage': 'முதல் திருமணம்',
    'Second Marriage': 'இரண்டாம் திருமணம்',
    'Middle Class': 'நடுத்தர வர்க்கம்',
    Fair: 'வெள்ளை நிறம்'
  };

  return map[en] || en || '-';
}
yesNo(value: any): string {
  if (value === true || value === 'Yes' || value === 'yes') {
    return this.currentLang === 'ta' ? 'ஆம்' : 'Yes';
  }

  if (value === false || value === 'No' || value === 'no') {
    return this.currentLang === 'ta' ? 'இல்லை' : 'No';
  }

  return '-';
}

isYes(value: any): boolean {
  return value === true || value === 'Yes' || value === 'yes';
}

formatHeight(): string {
  if (this.profile?.height_text) return this.v(this.profile.height_text, this.profile.height_text_ta);
  if (this.profile?.height_cm) return `${this.profile.height_cm} cm`;
  return '-';
}

formatWeight(): string {
  if (this.profile?.weight_text) return this.v(this.profile.weight_text, this.profile.weight_text_ta);
  if (this.profile?.weight_kg) return `${this.profile.weight_kg} kg`;
  return '-';
}

formatSalary(): string {
  if (this.profile?.salary_text || this.profile?.salary_text_ta) {
    return this.v(this.profile.salary_text, this.profile.salary_text_ta);
  }

  if (this.profile?.salary_amount) {
    return `${this.profile.salary_currency || 'INR'} ${this.profile.salary_amount}`;
  }

  return '-';
}
statusText(status: string): string {
  if (this.currentLang === 'en') {
    return status || 'Pending';
  }

  const map: any = {
    Pending: 'நிலுவையில்',
    Approved: 'ஒப்புதல்',
    Rejected: 'நிராகரிக்கப்பட்டது',
    Blocked: 'தடைசெய்யப்பட்டது',
    'Under Review': 'மதிப்பாய்வில்'
  };

  return map[status || 'Pending'] || status;
}
 constructor(
  private cdr: ChangeDetectorRef,
  private router: Router
) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    setTimeout(() => {
      this.loadFromRoute();
    }, 0);
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
dhoshamText(value: string): string {
  if (this.currentLang === 'en') {
    return value || '-';
  }

  const map: any = {
    Yes: 'உண்டு',
    No: 'இல்லை'
  };

  return map[value] || value || '-';
}
getRasiChart(): string[] {

  if (!this.profile?.rasi_chart) {
    return [];
  }

  try {

    return typeof this.profile.rasi_chart === 'string'
      ? JSON.parse(this.profile.rasi_chart)
      : this.profile.rasi_chart;

  } catch {

    return [];

  }

}

getAmsamChart(): string[] {

  if (!this.profile?.amsam_chart) {
    return [];
  }

  try {

    return typeof this.profile.amsam_chart === 'string'
      ? JSON.parse(this.profile.amsam_chart)
      : this.profile.amsam_chart;

  } catch {

    return [];

  }

}
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['id'] && this.id) {
      await this.loadProfile(this.id);
    }
  }

  async loadFromRoute(): Promise<void> {
    const urlParts = window.location.pathname.split('/');
    const urlId = urlParts[urlParts.length - 1];

    if (!urlId) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    await this.loadProfile(urlId);
  }

  async loadProfile(id: string): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('profile_id', id)
      .single();

    this.profile = error ? null : data;
    console.log(this.profile);
    this.isLoading = false;
    this.cdr.detectChanges();
  }


goToPrint(withPhoto: boolean, withAddress: boolean): void {
  if (!this.profile?.profile_id) return;

  this.router.navigate(
    ['/admin/profile-print', this.profile.profile_id],
    {
      queryParams: {
        photo: withPhoto ? '1' : '0',
        address: withAddress ? '1' : '0'
      }
    }
  );
}

  async updateStatus(status: string): Promise<void> {
    if (!this.profile) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ profile_status: status })
      .eq('profile_id', this.profile.profile_id);

    if (error) {
     alert(
  this.currentLang === 'ta'
    ? 'நிலை புதுப்பிக்க முடியவில்லை'
    : 'Failed to update status'
);
      return;
    }

    this.profile.profile_status = status;
    this.cdr.detectChanges();

   alert(
  this.currentLang === 'ta'
    ? `சுயவிவரம் ${this.statusText(status)}`
    : `Profile ${status}`
);
  }

  onChartImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-avatar.png';
  }
}
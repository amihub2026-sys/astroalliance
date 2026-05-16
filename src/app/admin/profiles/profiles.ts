import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../core/supabase.client';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,
  RouterLink
],
  templateUrl: './profiles.html',
  styleUrls: ['./profiles.scss']
})
export class Profiles implements OnInit {
private platformId = inject(PLATFORM_ID);
private isBrowser = isPlatformBrowser(this.platformId);
constructor(
  private ngZone: NgZone,
  private cd: ChangeDetectorRef
) {}
  isLoading = true;

  searchTerm = '';

  statusFilter = 'All';

  profiles: any[] = [];

  currentPage = 1;
itemsPerPage = 5;

get currentLang(): 'en' | 'ta' {

  if (!this.isBrowser) {
    return 'en';
  }

  return (
    localStorage.getItem('tm_language') as 'en' | 'ta'
  ) || 'en';

}


labels: any = {
  en: {
    title: 'Manage Profiles',
    subtitle: 'Approve, reject, block and review matrimony profiles',
    refresh: 'Refresh',
    search: 'Search by name, profile code, city, gender, status...',
    profileCode: 'Profile Code',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    city: 'City',
    maritalStatus: 'Marital Status',
    status: 'Status',
    joined: 'Joined',
    actions: 'Actions',
    approve: 'Approve',
    review: 'Review',
    reject: 'Reject',
    block: 'Block',
    noProfiles: 'No profiles found',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    loading: 'Loading profiles...',
    all: 'All',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    blocked: 'Blocked',
    underReview: 'Under Review'
  },
  ta: {
    title: 'சுயவிவரங்களை நிர்வகிக்கவும்',
    subtitle: 'திருமண சுயவிவரங்களை ஒப்புதல், நிராகரிப்பு, தடை மற்றும் மதிப்பாய்வு செய்யவும்',
    refresh: 'புதுப்பிக்கவும்',
    search: 'பெயர், சுயவிவர குறியீடு, நகரம், பாலினம், நிலை மூலம் தேடவும்...',
    profileCode: 'சுயவிவர குறியீடு',
    name: 'பெயர்',
    age: 'வயது',
    gender: 'பாலினம்',
    city: 'நகரம்',
    maritalStatus: 'திருமண நிலை',
    status: 'நிலை',
    joined: 'இணைந்த தேதி',
    actions: 'செயல்கள்',
    approve: 'ஒப்புதல்',
    review: 'மதிப்பாய்வு',
    reject: 'நிராகரி',
    block: 'தடை செய்',
    noProfiles: 'சுயவிவரங்கள் இல்லை',
    previous: 'முந்தையது',
    next: 'அடுத்தது',
    page: 'பக்கம்',
    of: '/',
    loading: 'சுயவிவரங்கள் ஏற்றப்படுகின்றன...',
    all: 'அனைத்தும்',
    pending: 'நிலுவையில்',
    approved: 'ஒப்புதல்',
    rejected: 'நிராகரிக்கப்பட்டது',
    blocked: 'தடைசெய்யப்பட்டது',
    underReview: 'மதிப்பாய்வில்'
  }
};


txt(key: string): string {
  return this.labels[this.currentLang][key] || key;
}

statusText(status: string): string {
  const value = status || 'Pending';

  if (this.currentLang === 'en') {
    return value;
  }

  const map: any = {
    Pending: 'நிலுவையில்',
    Approved: 'ஒப்புதல்',
    Rejected: 'நிராகரிக்கப்பட்டது',
    Blocked: 'தடைசெய்யப்பட்டது',
    'Under Review': 'மதிப்பாய்வில்'
  };

  return map[value] || value;
}
  statuses = [
    'All',
    'Pending',
    'Approved',
    'Rejected',
    'Blocked',
    'Under Review'
  ];
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

maritalText(value: string): string {

  if (this.currentLang === 'en') {
    return value || '-';
  }

  const map: any = {
    Unmarried: 'திருமணம் ஆகாதவர்',
    Married: 'திருமணமானவர்',
    Divorced: 'விவாகரத்து பெற்றவர்',
    Widow: 'விதவை',
    Widower: 'மனைவியை இழந்தவர்'
  };

  return map[value] || value || '-';
}

cityText(value: string): string {

  if (this.currentLang === 'en') {
    return value || '-';
  }

  const map: any = {
    Other: 'மற்றவை',
    Madurai: 'மதுரை',
    Chennai: 'சென்னை',
    Coimbatore: 'கோயம்புத்தூர்',
    Trichy: 'திருச்சி',
    Salem: 'சேலம்',
    'Abu Dhabi': 'அபுதாபி'
  };

  return map[value] || value || '-';
}

dateText(date: string): string {

  if (!date) {
    return '-';
  }

  return new Date(date).toLocaleDateString(
    this.currentLang === 'ta' ? 'ta-IN' : 'en-IN',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  );
}
  async ngOnInit(): Promise<void> {
    await this.loadProfiles();
  }

  async loadProfiles(): Promise<void> {

    this.isLoading = true;

    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        profile_id,
        profile_code,
        full_name,
full_name_ta,
        gender_text,
        dob,
        city_text,
        marital_status_text,
        profile_status,
        created_at
      `)
      .order('created_at', { ascending: false });

  this.ngZone.run(() => {

  if (error) {

    console.error('Profiles error:', error);

    this.profiles = [];

  } else {

    this.profiles = data || [];

  }

  this.isLoading = false;

  this.cd.detectChanges();

});
  }

  get filteredProfiles(): any[] {

    const term =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.profiles.filter(profile => {

      const matchesSearch =

        !term ||

        String(profile.profile_code || '')
          .toLowerCase()
          .includes(term)

        ||

        String(profile.full_name || '')
          .toLowerCase()
          .includes(term)

        ||

        String(profile.gender_text || '')
          .toLowerCase()
          .includes(term)

        ||

        String(profile.city_text || '')
          .toLowerCase()
          .includes(term)

        ||

        String(profile.marital_status_text || '')
          .toLowerCase()
          .includes(term)

        ||

        String(profile.profile_status || '')
          .toLowerCase()
          .includes(term);

      const status =
        profile.profile_status || 'Pending';

      const matchesStatus =

        this.statusFilter === 'All'

        ||

        status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }
get paginatedProfiles(): any[] {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.filteredProfiles.slice(start, start + this.itemsPerPage);
}

get totalPages(): number {
  return Math.ceil(this.filteredProfiles.length / this.itemsPerPage) || 1;
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

resetPage(): void {
  this.currentPage = 1;
}
  calculateAge(dob: string): number | string {

    if (!dob) return '-';

    const birthDate = new Date(dob);

    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const month =
      today.getMonth() -
      birthDate.getMonth();

    if (
      month < 0 ||
      (
        month === 0 &&
        today.getDate() < birthDate.getDate()
      )
    ) {
      age--;
    }

    return age;
  }

  async updateStatus(
    profile: any,
    status: string
  ): Promise<void> {

    const updateData: any = {
      profile_status: status
    };

    if (status === 'Approved') {
      updateData.approved_at =
        new Date().toISOString();
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('profile_id', profile.profile_id);

    if (error) {
      console.error(
        'Profile status update error:',
        error
      );

      alert('Failed to update profile status');

      return;
    }

    await this.loadProfiles();
  }

  async refresh(): Promise<void> {
    await this.loadProfiles();
  }

}
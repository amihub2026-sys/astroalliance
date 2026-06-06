import {
  Component,
OnInit,
AfterViewInit,
ViewChild,
ElementRef,
  inject,
  PLATFORM_ID,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { SnackbarService } from '../../shared/snackbar.service';
import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../core/supabase.client';
import { Router } from '@angular/router';@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule
],
  templateUrl: './profiles.html',
  styleUrls: ['./profiles.scss']
})
export class Profiles implements OnInit, AfterViewInit {
private platformId = inject(PLATFORM_ID);
private isBrowser = isPlatformBrowser(this.platformId);
constructor(
  private ngZone: NgZone,
  private cd: ChangeDetectorRef,
  private router: Router,
  private snackbar: SnackbarService
) {}
  isLoading = true;
@ViewChild('tableWrap') tableWrap!: ElementRef<HTMLDivElement>;
  searchTerm = '';

  profileCodeFilter = '';
nameFilter = '';
phoneFilter = '';
cityFilter = '';
religionFilter = '';
casteFilter = '';
genderFilter = '';

cityOptions: string[] = [];
religionOptions: string[] = [];
casteOptions: string[] = [];

  statusFilter = 'All';

  profiles: any[] = [];

  userPlans: any[] = [];

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
    noProfiles: 'மேட்ச்சஸ் இல்லை',
    previous: 'முந்தையது',
    next: 'அடுத்தது',
    page: 'பக்கம்',
    of: '/',
    loading: 'மேட்ச்சஸ் ஏற்றப்படுகின்றன...',
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
  this.ngZone.run(() => {
    this.isLoading = true;
    this.cd.detectChanges();
  });

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .neq('profile_status', 'Deleted')
      .order('created_at', { ascending: false });

    if (error) {
     
     this.snackbar.error(error.message);
      this.profiles = [];
      return;
    }

const userIds = (data || [])
  .map((p: any) => p.user_id)
  .filter(Boolean);

const { data: subsData, error: subsError } = await supabase
  .from('user_subscriptions')
.select(`
  user_id,
  profile_id,
  payment_mode,
  start_date,
  end_date,
    total_contacts_allowed,
    contacts_used,
    is_active,
    mst_plans (
      plan_name,
      contact_limit,
      profile_view_limit
    )
  `)
  .in('user_id', userIds)
  .eq('is_active', true);

if (subsError) {
  
}

this.userPlans = subsData || [];

   this.profiles = (data || [])
  .sort((a: any, b: any) => {

    const aPending =
      (a.profile_status || 'Pending') === 'Pending';

    const bPending =
      (b.profile_status || 'Pending') === 'Pending';

    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;

    return new Date(
      b.updated_at || b.created_at
    ).getTime() -
    new Date(
      a.updated_at || a.created_at
    ).getTime();

  })
  .map(profile => {
const plan = this.userPlans?.find((p: any) =>
  p.user_id === profile.user_id ||
  p.profile_id === profile.profile_id
) || null;

const planData = Array.isArray(plan?.mst_plans)
  ? plan.mst_plans[0]
  : plan?.mst_plans;

      return {
        ...profile,
package_name: planData?.plan_name || '-',
payment_mode: plan?.payment_mode || '-',
purchased_date: plan?.start_date || '-',
expired_date: plan?.end_date || '-',
limits: plan
  ? `${plan?.total_contacts_allowed || 0} contacts / ${planData?.profile_view_limit || 0} views`
  : '-',
views_count: Number(plan?.contacts_used || 0)
      };
    });

    this.cityOptions = [...new Set(this.profiles.map(p => p.city_text).filter(Boolean))];
    this.religionOptions = [...new Set(this.profiles.map(p => p.religion_text).filter(Boolean))];
    this.casteOptions = [...new Set(this.profiles.map(p => p.caste_text).filter(Boolean))];

  } catch (err) {


  } finally {
    this.ngZone.run(() => {
     this.isLoading = false;
this.cd.detectChanges();

setTimeout(() => {
  this.syncTableScroll();
}, 300);
    });
  }
}

async refresh(): Promise<void> {
  this.searchTerm = '';

  this.profileCodeFilter = '';
  this.nameFilter = '';
  this.phoneFilter = '';
  this.cityFilter = '';
  this.religionFilter = '';
  this.casteFilter = '';
  this.genderFilter = '';

  this.statusFilter = 'All';

  this.currentPage = 1;

  await this.loadProfiles();
}
get filteredProfiles(): any[] {

  return this.profiles.filter(profile => {

    const matchesCode =
      !this.profileCodeFilter ||
      String(profile.profile_code || '')
        .toLowerCase()
        .includes(this.profileCodeFilter.toLowerCase());

    const matchesName =
      !this.nameFilter ||
      String(profile.full_name || '')
        .toLowerCase()
        .includes(this.nameFilter.toLowerCase());

    const matchesPhone =
  !this.phoneFilter ||
  String(profile.mobile || profile.phone || profile.phone_number || '')
    .toLowerCase()
    .includes(this.phoneFilter.toLowerCase());

    const matchesCity =
      !this.cityFilter ||
      profile.city_text === this.cityFilter;

    const matchesReligion =
      !this.religionFilter ||
      profile.religion_text === this.religionFilter;

    const matchesCaste =
      !this.casteFilter ||
      profile.caste_text === this.casteFilter;

    const matchesGender =
      !this.genderFilter ||
      profile.gender_text === this.genderFilter;

    return (
  matchesCode &&
  matchesName &&
  matchesPhone &&
  matchesCity &&
  matchesReligion &&
  matchesCaste &&
  matchesGender
);
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

viewProfile(profile: any, event?: Event): void {
  event?.stopPropagation();

  this.router.navigate(['/admin/profile', profile.profile_id]);
}

editProfile(profile: any, event?: Event): void {
  event?.stopPropagation();

  if (!profile?.profile_id) {
    this.snackbar.error('Profile id missing');
    return;
  }

this.router.navigate(['/admin/create-biodata'], {
  queryParams: {
    edit: 'true',
    id: profile.profile_id,
    adminCreate: 'true'
  }
});
}

async approveProfile(profile: any, event?: Event): Promise<void> {
  event?.stopPropagation();

  const { error } = await supabase
    .from('user_profiles')
    .update({
  profile_status: 'Approved'
})
    .eq('profile_id', profile.profile_id);

  if (error) {
   
    this.snackbar.error(error.message);
    return;
  }

  profile.profile_status = 'Approved';
  this.snackbar.success('Profile approved successfully');
  await this.loadProfiles();
}

addPackage(profile: any, event?: Event): void {
  event?.stopPropagation();

  this.router.navigate(['/admin/user-plans'], {
    queryParams: {
      profile_id: profile.profile_id,
      profile_code: profile.profile_code
    }
  });
}

async deleteProfile(profile: any, event?: Event): Promise<void> {
  event?.stopPropagation();

  const confirmDelete = confirm(
    `Are you sure you want to permanently delete ${profile.full_name || profile.profile_code}?`
  );

  if (!confirmDelete) return;

  const { error: viewsError } = await supabase
    .from('profile_views')
    .delete()
    .or(`viewer_profile_id.eq.${profile.profile_id},viewed_profile_id.eq.${profile.profile_id}`);

  if (viewsError) {
    this.snackbar.error(viewsError.message);
    return;
  }

  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('profile_id', profile.profile_id);

  if (error) {
   this.snackbar.error(error.message);
    return;
  }

 this.snackbar.success('Profile deleted successfully');
  await this.loadProfiles();
}
allowOnlyNumbers(event: KeyboardEvent): void {

  const charCode = event.which
    ? event.which
    : event.keyCode;

  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}
sanitizePhoneFilter(): void {

  this.phoneFilter =
    (this.phoneFilter || '')
      .replace(/\D/g, '');

}
ngAfterViewInit(): void {
  if (!this.isBrowser) return;

  setTimeout(() => {
    this.syncTableScroll();
  }, 500);
}
syncTableScroll(): void {
  if (!this.isBrowser) return;

  const topScroll = document.querySelector('.top-scroll') as HTMLElement;
  const scrollWidth = document.querySelector('.scroll-width') as HTMLElement;
  const bottomScroll = this.tableWrap?.nativeElement;

  const table = bottomScroll?.querySelector('table') as HTMLElement;

  if (!topScroll || !scrollWidth || !bottomScroll || !table) return;

  // Use actual table width
  scrollWidth.style.width = table.scrollWidth + 'px';

  topScroll.onscroll = () => {
    bottomScroll.scrollLeft = topScroll.scrollLeft;
  };

  bottomScroll.onscroll = () => {
    topScroll.scrollLeft = bottomScroll.scrollLeft;
  };
}
shareWelcomeWhatsapp(profile: any, event?: Event): void {
  event?.stopPropagation();

  const profileLink =
    `https://astroalliance.vercel.app/profile/${profile.profile_id}`;

  const message = `
 வணக்கம்

 Astro Alliance Matrimony-க்கு உங்களை அன்புடன் வரவேற்கிறோம்.

உங்கள் திருமண சுயவிவரம் வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது.

 சுயவிவர எண் : ${profile.profile_code || '-'}

 பெயர் : ${profile.full_name || '-'}

 உங்கள் சுயவிவரத்தை பார்க்க:
${profileLink}

உங்களுக்கு பொருத்தமான வாழ்க்கைத் துணையை கண்டுபிடிக்க எங்கள் மனமார்ந்த வாழ்த்துக்கள்.

 உதவி தேவைப்பட்டால் எங்களை தொடர்பு கொள்ளவும்.

 நன்றி
Astro Alliance Matrimony
`;
const phone = String(profile.mobile || '')
  .replace(/\D/g, '');

const whatsappUrl =
  `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

window.open(whatsappUrl, '_blank');
}
shareProfileWhatsapp(profile: any, event?: Event): void {
  event?.stopPropagation();

  const profileLink =
    `https://astroalliance.vercel.app/profiles?id=${profile.profile_id}`;

  const message = `
 வணக்கம்

 Astro Alliance Matrimony மூலம் உங்களுக்கு பொருத்தமான சுயவிவரம் பகிரப்படுகிறது.

 சுயவிவர எண் : ${profile.profile_code || '-'}

 பெயர் : ${profile.full_name || '-'}

 ஊர் : ${profile.city_text || '-'}

 சுயவிவரத்தை பார்க்க:
${profileLink}

இந்த சுயவிவரம் உங்களுக்கு பொருத்தமாக இருந்தால், மேலும் தகவல்களுக்கு எங்களை தொடர்பு கொள்ளவும்.

 நன்றி
Astro Alliance Matrimony
`;

  const phone = String(profile.mobile || '').replace(/\D/g, '');

  const whatsappUrl =
    `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');
}
}

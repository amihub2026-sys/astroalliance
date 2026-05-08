import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { App } from '../app';
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
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plans.html',
  styleUrls: ['./plans.scss']
})
export class Plans implements OnInit {
  app = inject(App);
  route = inject(ActivatedRoute);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  fromPage = '';
  lockedProfileId = '';
  lockedProfileName = '';
  showProfileUnlockBanner = false;

  planSelected = false;
  selectedPlanName = '';
  isSavingPlan = false;
  isLoadingDbPlans = false;

  dbPlans: DbPlanRow[] = [];

  translations = {
    en: {
      hero: {
        miniTitle: 'CHOOSE YOUR PERFECT MEMBERSHIP',
        title: 'Affordable Matrimony Plans for Every Journey',
        subtitle:
          'Select the right subscription plan to unlock verified contacts, premium visibility, better responses, and a smoother matchmaking experience.'
      },
      section: {
        title: 'Our Membership Plans',
        subtitle: 'Choose the best plan for your matrimony journey'
      },
      labels: {
        mostPopular: 'Most Popular',
        choosePlan: 'Choose Plan',
        unlockTitle: 'Unlock Full Profile Access',
        unlockText:
          'To view this full matrimony profile, contact details, and premium actions, please choose a membership plan.',
        selectedProfile: 'Selected Profile',
        profileId: 'Profile ID',
        backToProfiles: 'Back to Profiles',
        activatedTitle: 'Plan Activated Successfully!',
        activatedText:
          'You can now continue to view the full profile and access premium details.',
        viewProfile: 'View Profile'
      }
    },
    ta: {
      hero: {
        miniTitle: 'உங்களுக்கு பொருத்தமான உறுப்பினர் திட்டத்தை தேர்வு செய்யுங்கள்',
        title: 'ஒவ்வொரு திருமண பயணத்திற்கும் மலிவான மேட்ரிமோனி திட்டங்கள்',
        subtitle:
          'சரிபார்க்கப்பட்ட தொடர்புகள், பிரீமியம் காட்சிப்படுத்தல், சிறந்த பதில்கள் மற்றும் எளிய வாழ்க்கைத்துணைத் தேடல் அனுபவத்திற்கான சரியான சந்தா திட்டத்தைத் தேர்வு செய்யுங்கள்.'
      },
      section: {
        title: 'எங்கள் உறுப்பினர் திட்டங்கள்',
        subtitle: 'உங்கள் திருமண பயணத்திற்கான சிறந்த திட்டத்தை தேர்வு செய்யுங்கள்'
      },
      labels: {
        mostPopular: 'அதிகம் தேர்வு செய்யப்பட்டது',
        choosePlan: 'திட்டத்தை தேர்வு செய்க',
        unlockTitle: 'முழு சுயவிவர அணுகலை திறக்கவும்',
        unlockText:
          'இந்த முழு திருமண சுயவிவரம், தொடர்பு விவரங்கள் மற்றும் பிரீமியம் அம்சங்களை பார்க்க உறுப்பினர் திட்டத்தை தேர்வு செய்யவும்.',
        selectedProfile: 'தேர்ந்தெடுத்த சுயவிவரம்',
        profileId: 'சுயவிவர எண்',
        backToProfiles: 'சுயவிவரங்களுக்கு திரும்பு',
        activatedTitle: 'திட்டம் வெற்றிகரமாக செயல்படுத்தப்பட்டது!',
        activatedText:
          'இப்போது நீங்கள் முழு சுயவிவரத்தையும் பிரீமியம் விவரங்களையும் பார்க்கலாம்.',
        viewProfile: 'சுயவிவரம் பார்க்க'
      }
    }
  };

  plans = [
    // {
    //   name: { en: 'ASTRO ALLIANCE', ta: 'திருமகள் மேட்ரிமோனி' },
    //   price: '₹999',
    //   duration: { en: '/ 3 Months', ta: '/ 3 மாதங்கள்' },
    //   validity: { en: 'Validity: 3 Months', ta: 'செல்லுபடியாகும் காலம்: 3 மாதங்கள்' },
    //   popular: false,
    //   features: {
    //     en: [
    //       'View up to 20 contacts',
    //       'Basic profile visibility',
    //       'Email support',
    //       'Trusted matrimony access'
    //     ],
    //     ta: [
    //       '20 தொடர்புகள் வரை பார்க்கலாம்',
    //       'அடிப்படை சுயவிவர காட்சிப்படுத்தல்',
    //       'மின்னஞ்சல் உதவி',
    //       'நம்பகமான மேட்ரிமோனி அணுகல்'
    //     ]
    //   }
    // },
    {
  code: 'TM_CLASSIC',
  name: { en: 'TM Classic', ta: 'TM கிளாசிக்' },
      price: '₹1999',
      duration: { en: '/ 6 Months', ta: '/ 6 மாதங்கள்' },
      validity: { en: 'Validity: 6 Months', ta: 'செல்லுபடியாகும் காலம்: 6 மாதங்கள்' },
      popular: true,
      features: {
        en: [
          'View up to 50 contacts',
          'Premium visibility',
          'Priority support',
          'Better response reach'
        ],
        ta: [
          '50 தொடர்புகள் வரை பார்க்கலாம்',
          'பிரீமியம் காட்சிப்படுத்தல்',
          'முன்னுரிமை உதவி',
          'சிறந்த பதில் அடைவு'
        ]
      }
    },
   {
  code: 'TM_PREMIUM',
  name: { en: 'TM Premium', ta: 'TM பிரீமியம்' },
      price: '₹2999',
      duration: { en: '/ 9 Months', ta: '/ 9 மாதங்கள்' },
      validity: { en: 'Validity: 9 Months', ta: 'செல்லுபடியாகும் காலம்: 9 மாதங்கள்' },
      popular: false,
      features: {
        en: [
          'View up to 80 contacts',
          'Profile boost',
          'Premium visibility',
          'Priority support'
        ],
        ta: [
          '80 தொடர்புகள் வரை பார்க்கலாம்',
          'சுயவிவர மேம்பாடு',
          'பிரீமியம் காட்சிப்படுத்தல்',
          'முன்னுரிமை உதவி'
        ]
      }
    },
{
  code: 'TM_ELITE',
  name: { en: 'TM Elite', ta: 'TM எலீட்' },
      price: '₹3999',
      duration: { en: '/ 12 Months', ta: '/ 12 மாதங்கள்' },
      validity: { en: 'Validity: 12 Months', ta: 'செல்லுபடியாகும் காலம்: 12 மாதங்கள்' },
      popular: false,
      features: {
        en: [
          'View up to 120 contacts',
          'Profile boost',
          'Premium visibility',
          'Priority support'
        ],
        ta: [
          '120 தொடர்புகள் வரை பார்க்கலாம்',
          'சுயவிவர மேம்பாடு',
          'பிரீமியம் காட்சிப்படுத்தல்',
          'முன்னுரிமை உதவி'
        ]
      }
    }
  ];

  constructor(private snackbar: SnackbarService) {
    this.route.queryParamMap.subscribe(params => {
      this.fromPage = params.get('from') || '';
      this.lockedProfileId = params.get('profileId') || '';
      this.lockedProfileName = params.get('profileName') || '';
      this.showProfileUnlockBanner = this.fromPage === 'profiles';
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadDbPlans();
  }

  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  get tr() {
    return this.translations[this.currentLang];
  }

  getText(value: any): string {
    if (typeof value === 'string') return value;
    return value?.[this.currentLang] || value?.en || '';
  }

  getFeatures(features: any): string[] {
    return features?.[this.currentLang] || features?.en || [];
  }

  private getLoggedInUserId(): string | null {
    if (!this.isBrowser) return null;

    try {
      const rawUser = localStorage.getItem('matrimony_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed?.user_id) return String(parsed.user_id);
      }
    } catch (error) {
      console.error('Error reading matrimony_user:', error);
    }

    const stored = localStorage.getItem('app_user_id');
    return stored ? String(stored) : null;
  }

  async loadDbPlans(): Promise<void> {
    this.isLoadingDbPlans = true;

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

      if (error) {
        throw error;
      }

      const rows = Array.isArray(data) ? data : [];
      this.dbPlans = rows.filter((row: any) => row?.is_active === true);

    } catch (error) {
      console.error('Load DB plans error:', error);
      this.dbPlans = [];
    } finally {
      this.isLoadingDbPlans = false;
    }
  }

  goBackToProfiles() {
    this.router.navigate(['/profiles']);
  }

  private normalize(value: string | null | undefined): string {
    return String(value || '').trim().toLowerCase();
  }

  private getDbPlanByName(planName: string): DbPlanRow | undefined {
    const normalizedName = this.normalize(planName);
    const normalizedCode = this.normalize(planName).replace(/\s+/g, '_');

    return this.dbPlans.find((p) => {
      const dbName = this.normalize(p.plan_name);
      const dbCode = this.normalize(p.plan_code);

      return (
        dbName === normalizedName ||
        dbCode === normalizedCode ||
        dbCode === `tm_${normalizedName.replace(/\s+/g, '_')}` ||
        dbCode === `tm${normalizedName.replace(/\s+/g, '_')}`
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

  selectPlan(plan: any) {
    if (this.isSavingPlan) return;

    const userId = this.getLoggedInUserId();

    if (!userId) {
      this.snackbar.error('⚠ Please login first');
      this.router.navigate(['/login'], {
        queryParams: {
          from: this.fromPage || 'plans',
          profileId: this.lockedProfileId,
          profileName: this.lockedProfileName
        }
      });
      return;
    }

   const planName = this.getText(plan.name);
const planCode = plan.code || '';
const planPrice = plan.price || '';
const planDuration = this.getText(plan.duration);

    this.router.navigate(['/payment'], {
    queryParams: {
  planName,
  planCode,
  planPrice,
  planDuration,
        from: this.fromPage || '',
        profileId: this.lockedProfileId || '',
        profileName: this.lockedProfileName || ''
      }
    });
  }

  goToProfile() {
    this.router.navigate(['/profile-view'], {
      queryParams: {
        unlocked: 'true',
        profileId: this.lockedProfileId || 'AMI101',
        profileName: this.lockedProfileName || 'Anand Kumar',
        selectedPlan: this.selectedPlanName || 'TM Classic'
      }
    });
  }
}
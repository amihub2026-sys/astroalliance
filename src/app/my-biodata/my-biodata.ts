import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { supabase } from '../core/supabase.client';
import { App } from '../app';

@Component({
  selector: 'app-my-biodata',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-biodata.html',
  styleUrls: ['./my-biodata.scss']
})
export class MyBiodataComponent implements OnInit {
  loading = true;
  errorMessage = '';
  profile: any = null;
  isNavigating = false;
valueTaMap: Record<string, string> = {};
  planetShortMap: Record<string, string> = {
    '1': 'வி',
    '2': 'கே',
    '3': 'ல',
    '4': 'செ',
    '5': 'பு',
    '6': 'சந்',
    '7': 'ரா',
    '8': 'ச',
    '9': 'சூ',
    '10': 'சுக்',
    '11': 'மா',
    '12': 'வ'
  };

constructor(
  private router: Router,
  private cdr: ChangeDetectorRef,
  private zone: NgZone,
  public app: App
) {}
async ngOnInit(): Promise<void> {
  await this.loadTamilValueMaps();
  await this.loadMyBiodata();
}

  private getStoredLoggedInUser(): any | null {
    try {
      const raw = localStorage.getItem('matrimony_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private async resolveCurrentUserId(): Promise<string | null> {
    try {
      const loggedInUser = this.getStoredLoggedInUser();

      if (loggedInUser?.user_id) {
        return String(loggedInUser.user_id);
      }

      const storedAppUserId = localStorage.getItem('app_user_id');
      if (storedAppUserId) {
        return storedAppUserId;
      }

      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (!error && user?.id) {
        const { data: appUser, error: appUserError } = await supabase
          .from('app_users')
          .select('user_id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (!appUserError && appUser?.user_id) {
          localStorage.setItem('app_user_id', String(appUser.user_id));
          return String(appUser.user_id);
        }
      }

      return null;
    } catch (error) {
      console.error('resolveCurrentUserId error:', error);
      return null;
    }
  }

  private toChartArray(value: any): string[] {
    if (Array.isArray(value)) {
      return Array.from({ length: 12 }, (_, i) => String(value[i] ?? ''));
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return Array.from({ length: 12 }, (_, i) => String(parsed[i] ?? ''));
        }
      } catch {
        return Array(12).fill('');
      }
    }

    return Array(12).fill('');
  }

  getPlanetShort(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    return this.planetShortMap[String(value)] || String(value);
  }
get currentLang(): 'en' | 'ta' {
  return this.app.currentLang || 'en';
}
showTextValue(enValue: any, taValue?: any): string {
  const en = String(enValue || '').trim();
  const ta = String(taValue || '').trim();

  if (this.currentLang === 'ta') {
    return ta || this.valueTaMap[en.toLowerCase()] || en || '-';
  }

  return en || '-';
}

showLangValue(enValue: any, taValue?: any): string {
  const en = String(enValue || '').trim();
  const ta = String(taValue || '').trim();

  if (this.currentLang === 'ta') {
    return ta || en || '-';
  }

  return en || '-';
}

private async loadTamilValueMaps(): Promise<void> {
 const [religions, castes, countries, states, cities, educations, occupations] =
    await Promise.all([
      supabase.from('mst_religions').select('religion_name, religion_name_ta'),
      supabase.from('mst_castes').select('caste_name, caste_name_ta'),
      supabase.from('mst_countries').select('country_name, country_name_ta'),
      supabase.from('mst_states').select('state_name, state_name_ta'),
      supabase.from('mst_cities').select('city_name, city_name_ta'),
      supabase.from('mst_education_levels').select('education_name, education_name_ta'),
supabase.from('mst_occupations').select('occupation_name, occupation_name_ta')
    ]);

  const addMap = (rows: any[] | null, enKey: string, taKey: string) => {
    (rows || []).forEach((row: any) => {
      const en = row?.[enKey];
      const ta = row?.[taKey];

      if (en && ta) {
        this.valueTaMap[String(en).trim().toLowerCase()] = String(ta).trim();
      }
    });
  };

  addMap(religions.data, 'religion_name', 'religion_name_ta');
  addMap(castes.data, 'caste_name', 'caste_name_ta');
  addMap(countries.data, 'country_name', 'country_name_ta');
  addMap(states.data, 'state_name', 'state_name_ta');
  addMap(cities.data, 'city_name', 'city_name_ta');
  addMap(educations.data, 'education_name', 'education_name_ta');
  addMap(occupations.data, 'occupation_name', 'occupation_name_ta');
}
showValue(type: string, value: string): string {

  if (!value) return '-';

  if (this.currentLang !== 'ta') {
    return value;
  }

  const map: any = {

    gender: {
      Male: 'ஆண்',
      Female: 'பெண்'
    },

    maritalStatus: {
      Unmarried: 'திருமணம் ஆகாதவர்',
      Divorced: 'விவாகரத்து',
      Widowed: 'விதவை / விதவன்'
    },

    dhosham: {
      No: 'இல்லை',
      Yes: 'உண்டு',
      'Dont Know': 'தெரியாது'
    },

  rasi: {
  Mesham: 'மேஷம்',
  Rishabam: 'ரிஷபம்',
  Mithunam: 'மிதுனம்',
  Kadagam: 'கடகம்',
  Simmam: 'சிம்மம்',
  Kanni: 'கன்னி',
  Thulam: 'துலாம்',
  Viruchigam: 'விருச்சிகம்',
  Dhanusu: 'தனுசு',
  Magaram: 'மகரம்',
  Kumbam: 'கும்பம்',
  Meenam: 'மீனம்'
},

nakshatra: {
  Ashwini: 'அஸ்வினி',
  Bharani: 'பரணி',
  Karthigai: 'கார்த்திகை',
  Rohini: 'ரோகிணி',
  Mirugasirisham: 'மிருகசீரிடம்',
  Thiruvathirai: 'திருவாதிரை',
  Punarpoosam: 'புனர்பூசம்',
  Poosam: 'பூசம்',
  Ayilyam: 'ஆயில்யம்',
  Magam: 'மகம்',
  Pooram: 'பூரம்',
  Uthiram: 'உத்திரம்',
  Hastham: 'ஹஸ்தம்',
  Chithirai: 'சித்திரை',
  Swathi: 'சுவாதி',
  Visakam: 'விசாகம்',
  Anusham: 'அனுஷம்',
  Kettai: 'கேட்டை',
  Moolam: 'மூலம்',
  Pooradam: 'பூராடம்',
  Uthiradam: 'உத்திராடம்',
  Thiruvonam: 'திருவோணம்',
  Avittam: 'அவிட்டம்',
  Sathayam: 'சதயம்',
  Poorattathi: 'பூரட்டாதி',
  Uthirattathi: 'உத்திரட்டாதி',
  Revathi: 'ரேவதி'
}

  };

  return map[type]?.[value] || value;

}
  private normalizeProfile(data: any): any {
    return {
      ...data,
      full_name: data?.full_name || '',
full_name_ta: data?.full_name_ta || '',
      profile_code: data?.profile_code || '',
      profile_image_url: data?.profile_image_url || '',
      gender_text: data?.gender_text || '',
      age: data?.age || '',
      marital_status_text: data?.marital_status_text || '',
      mobile: data?.mobile || '',
      email: data?.email || '',

      religion_text: data?.religion_text || '',
      caste_text: data?.caste_text || '',
      height_text: data?.height_text || '',
      weight_text: data?.weight_text || '',

      father_name: data?.father_name || '',
      mother_name: data?.mother_name || '',
      father_occupation_text: data?.father_occupation_text || '',
      father_occupation: data?.father_occupation || '',
      mother_occupation_text: data?.mother_occupation_text || '',
      mother_occupation: data?.mother_occupation || '',
      siblings_text: data?.siblings_text || '',
     father_name_ta: data?.father_name_ta || '',
mother_name_ta: data?.mother_name_ta || '',
father_occupation_ta: data?.father_occupation_ta || '',
mother_occupation_ta: data?.mother_occupation_ta || '',
siblings_ta: data?.siblings_ta || '',

     education_text: data?.education_text || '',
education_text_ta: data?.education_text_ta || '',
      occupation_text: data?.occupation_text || '',
      company_name: data?.company_name || '',
occupation_text_ta: data?.occupation_text_ta || '',
company_name_ta: data?.company_name_ta || '',
address_line_ta: data?.address_line_ta || '',
birth_place_ta: data?.birth_place_ta || '',
salary_text: data?.salary_text || '',
      address_line: data?.address_line || '',
      city_text: data?.city_text || '',
      state_text: data?.state_text || '',
      country_text: data?.country_text || '',
religion_name_ta: data?.religion?.religion_name_ta || '',
caste_name_ta: data?.caste?.caste_name_ta || '',
city_name_ta: data?.city?.city_name_ta || '',
state_name_ta: data?.state?.state_name_ta || '',
country_name_ta: data?.country?.country_name_ta || '',
      rasi_text: data?.rasi_text || '',
      nakshatra_text: data?.nakshatra_text || '',
      lagnam_text: data?.lagnam_text || '',
      gothram: data?.gothram || '',
gothram_ta: data?.gothram_ta || '',
      dhosham_text: data?.dhosham_text || '',
      birth_time: data?.birth_time || '',
      birth_place: data?.birth_place || '',

      about_me: data?.about_me || '',
about_me_ta: data?.about_me_ta || '',

partner_expectation: data?.partner_expectation || '',
partner_expectation_ta: data?.partner_expectation_ta || '',

      rasi_chart: this.toChartArray(data?.rasi_chart),
      amsam_chart: this.toChartArray(data?.amsam_chart)
    };
  }

  async loadMyBiodata(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.profile = null;
    this.cdr.detectChanges();

    try {
      const userId = await this.resolveCurrentUserId();

      if (!userId) {
        this.errorMessage = 'Please login first.';
        return;
      }

  const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();
   

      if (error) {
        throw error;
      }

      if (!data) {
        this.errorMessage = 'No biodata found. Please create your biodata first.';
        return;
      }

  this.zone.run(() => {
  this.profile = this.normalizeProfile(data);
  this.loading = false;
  this.cdr.detectChanges();
});
    } catch (error: any) {
      console.error('Load my biodata error:', error);
      this.errorMessage = error?.message || 'Unable to load biodata.';
    } finally {
  this.zone.run(() => {
    this.loading = false;
    this.cdr.detectChanges();
  });
}
  }

  editBiodata(): void {
    if (this.isNavigating) return;

    this.isNavigating = true;

    this.router.navigate(['/biodata']).finally(() => {
      setTimeout(() => {
        this.isNavigating = false;
        this.cdr.detectChanges();
      }, 600);
    });
  }
}
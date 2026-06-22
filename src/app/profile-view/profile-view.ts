import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { App } from '../app';
import { supabase } from '../core/supabase.client';
import { AstroService } from '../services/astro.service';
import { SnackbarService } from '../shared/snackbar.service';

type LangText = {
  en: string;
  ta: string;
};

interface ProfileViewItem {
  id: string;
  profileImage: string;
  galleryImages: string[];
  videoUrl: string;

  fullName: LangText;
  gender: LangText;
  dob: string;
  age: number;
  maritalStatus: LangText;
childrenStatus: string;
childrenDetails: string;
kalappuThirumanam: string;
kalappuThirumanamDetails: LangText;
handicapStatus: string;
handicapDetails: LangText;
subCaste: LangText;
  mobile: string;
  additionalMobile: string;
  email: string;
  height: string;
  weight: string;
  religion: LangText;
  caste: LangText;

fatherName: LangText;
motherName: LangText;
fatherOccupation: LangText;
motherOccupation: LangText;
siblings: LangText;
marriedBrothers: string;
unmarriedBrothers: string;
marriedSisters: string;
unmarriedSisters: string;
kudumbaNilai: LangText;
poorvegam: LangText;
iruppidam: LangText;
  education: LangText;
  job: LangText;
  company: LangText;
  workPlace: LangText;
  salary: string;

  address: LangText;
  city: LangText;
  state: LangText;
  country: LangText;

  horoscopeImage: string;
  rasi: LangText;
  nakshatra: LangText;
  lagnam: LangText;
  gothram: LangText;
  dhosham: LangText;
  birthTime: string;
  birthPlace: LangText;
thisai: LangText;
thisaiIruppu: LangText;
paatham: LangText;
sothukal: LangText;
kuladeivam: LangText;
  about: LangText;
  partnerExpectation: LangText;
noCastePreference: boolean;
  rasiChart: string[];
  amsamChart: string[];
}

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-view.html',
  styleUrls: ['./profile-view.scss']
})
export class ProfileView implements OnInit {
  app = inject(App);
  route = inject(ActivatedRoute);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  astroService = inject(AstroService);
snackbar = inject(SnackbarService);
  unlocked = false;
  showHoroscope = false;
  selectedPlan = '';
  selectedProfileId = '';
  isLoading = false;
openFullPhoto = false;
selectedPhotoUrl = '';
openGalleryPopup = false;
currentGalleryIndex = 0;
openVideoFull = false;
  profile: ProfileViewItem | null = null;
  astroMatch: any = null;
  loadedProfileRow: any = null;
alreadySent = false;
alreadyShortlisted = false;
interestStatus = '';
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
openPhoto(photoUrl?: string) {

  const images = this.profile?.galleryImages || [];

  if (photoUrl) {
    const index = images.indexOf(photoUrl);

    this.currentGalleryIndex =
      index >= 0 ? index : 0;
  } else {
    this.currentGalleryIndex = -1;
  }

  this.selectedPhotoUrl =
    photoUrl || this.profile?.profileImage || '';

  this.openFullPhoto = true;
}
closePhoto() {
  this.openFullPhoto = false;
  this.selectedPhotoUrl = '';
}
openAdditionalPhotos() {
  this.openGalleryPopup = true;
}

closeAdditionalPhotos() {
  this.openGalleryPopup = false;
}
openVideoPopup() {
  this.openVideoFull = true;
}

closeVideoPopup() {
  this.openVideoFull = false;
}
openPhotoFromGallery(photoUrl: string) {

  this.openGalleryPopup = false;

  this.selectedPhotoUrl = photoUrl;

  this.openFullPhoto = true;
}
showNextPhoto() {

  if (!this.profile?.galleryImages?.length) return;

  const images = this.profile.galleryImages;

  this.currentGalleryIndex =
    (this.currentGalleryIndex + 1) % images.length;

  this.selectedPhotoUrl =
    images[this.currentGalleryIndex];

  this.cdr.detectChanges();
}

showPrevPhoto() {

  if (!this.profile?.galleryImages?.length) return;

  const images = this.profile.galleryImages;

  this.currentGalleryIndex =
    (this.currentGalleryIndex - 1 + images.length) %
    images.length;

  this.selectedPhotoUrl =
    images[this.currentGalleryIndex];

  this.cdr.detectChanges();
}
  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  async ngOnInit(): Promise<void> {
    const params = this.route.snapshot.queryParamMap;

    this.unlocked = params.get('unlocked') === 'true';
   
    this.selectedPlan = params.get('selectedPlan') || '';
    this.selectedProfileId = (params.get('profileId') || '').trim();



    await this.loadProfile();
   if (typeof window !== 'undefined') {
  (window as any).activeProfileViewComponent = this;
}
  }

private asLangText(value: string | null | undefined): LangText {
  const text = value?.trim() || '';

  return {
    en: text,
    ta: text
  };
}

private async translateToTamil(text: string): Promise<string> {
  if (!text || !text.trim()) return '';

  const { data, error } = await supabase.functions.invoke('translate-text', {
    body: {
      text,
      target: 'ta'
    }
  });

  if (error) {
   
    return text;
  }

  return data?.translatedText || text;
}

async translateProfileValuesToTamil(): Promise<void> {
  if (!this.profile) return;

  this.profile.fullName.ta = await this.translateToTamil(this.profile.fullName.en);
  this.profile.gender.ta = await this.translateToTamil(this.profile.gender.en);
  this.profile.maritalStatus.ta = await this.translateToTamil(this.profile.maritalStatus.en);
  this.profile.religion.ta = await this.translateToTamil(this.profile.religion.en);
  this.profile.caste.ta = await this.translateToTamil(this.profile.caste.en);
  this.profile.education.ta = await this.translateToTamil(this.profile.education.en);
  this.profile.job.ta = await this.translateToTamil(this.profile.job.en);
  this.profile.city.ta = await this.translateToTamil(this.profile.city.en);
  this.profile.state.ta = await this.translateToTamil(this.profile.state.en);
  this.profile.country.ta = await this.translateToTamil(this.profile.country.en);
  this.profile.about.ta = await this.translateToTamil(this.profile.about.en);
  this.profile.partnerExpectation.ta = await this.translateToTamil(this.profile.partnerExpectation.en);
this.profile.fatherName.ta =
  await this.translateToTamil(this.profile.fatherName.en);

this.profile.motherName.ta =
  await this.translateToTamil(this.profile.motherName.en);

this.profile.fatherOccupation.ta =
  await this.translateToTamil(this.profile.fatherOccupation.en);

this.profile.motherOccupation.ta =
  await this.translateToTamil(this.profile.motherOccupation.en);

this.profile.siblings.ta =
  await this.translateToTamil(this.profile.siblings.en);
  this.profile.rasi.ta =
  await this.translateToTamil(this.profile.rasi.en);

this.profile.nakshatra.ta =
  await this.translateToTamil(this.profile.nakshatra.en);

this.profile.lagnam.ta =
  await this.translateToTamil(this.profile.lagnam.en);

this.profile.gothram.ta =
  await this.translateToTamil(this.profile.gothram.en);

this.profile.dhosham.ta =
  await this.translateToTamil(this.profile.dhosham.en);

this.profile.birthPlace.ta =
  await this.translateToTamil(this.profile.birthPlace.en);
  this.cdr.detectChanges();
}

  getPlanetShort(value: any): string {
    if (value === null || value === undefined || value === '') return '';

    const parts = String(value)
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);

    if (!parts.length) return '';

    return parts
      .map(v => this.planetShortMap[v] || v)
      .join(' ');
  }

  private formatHeight(row: any): string {
    if (row?.height_text) return row.height_text;
    if (row?.height_cm) return `${row.height_cm} cm`;
    return '';
  }

  private formatWeight(row: any): string {
    if (row?.weight_text) return row.weight_text;
    if (row?.weight_kg) return `${row.weight_kg} kg`;
    return '';
  }

  private formatSalary(row: any): string {
    if (row?.salary_text) return row.salary_text;
    if (row?.salary_amount) {
      return `${row.salary_currency || 'INR'} ${row.salary_amount}`;
    }
    return '';
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

private normalizeGalleryImages(row: any): string[] {

  // additional_image_urls
  if (Array.isArray(row?.additional_image_urls)) {
    return row.additional_image_urls
      .filter((item: any) => !!item)
      .map((item: any) => String(item));
  }

  // additional_image_urls string JSON
  if (typeof row?.additional_image_urls === 'string') {
    try {
      const parsed = JSON.parse(row.additional_image_urls);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((item: any) => !!item)
          .map((item: any) => String(item));
      }
    } catch {}
  }

  // gallery_images
  if (Array.isArray(row?.gallery_images)) {
    return row.gallery_images
      .filter((item: any) => !!item)
      .map((item: any) => String(item));
  }

  // additional_images
  if (Array.isArray(row?.additional_images)) {
    return row.additional_images
      .filter((item: any) => !!item)
      .map((item: any) => String(item));
  }

  // image_urls
  if (Array.isArray(row?.image_urls)) {
    return row.image_urls
      .filter((item: any) => !!item)
      .map((item: any) => String(item));
  }

  // image_urls string JSON
  if (typeof row?.image_urls === 'string') {
    try {
      const parsed = JSON.parse(row.image_urls);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((item: any) => !!item)
          .map((item: any) => String(item));
      }
    } catch {}
  }

  return [];
}

  private formatDateForApi(dateStr: string): string {
    const value = String(dateStr || '').trim();
    if (!value) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const slashParts = value.split('/');
    if (slashParts.length === 3) {
      const [dd, mm, yyyy] = slashParts.map(part => part.trim());
      if (yyyy && mm && dd) {
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      }
    }

    const dashParts = value.split('-');
    if (dashParts.length === 3) {
      const [dd, mm, yyyy] = dashParts.map(part => part.trim());
      if (yyyy && yyyy.length === 4 && mm && dd) {
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      }
    }

    return value;
  }

  private normalizePlaceForApi(value: string | null | undefined): string {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return '';
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private normalizeTimeForApi(value: string | null | undefined): string {
    const text = String(value || '').trim();
    if (!text) return '';

    const parts = text.split(':');
    if (parts.length >= 2) {
      const hh = String(parts[0] || '').padStart(2, '0');
      const mm = String(parts[1] || '').padStart(2, '0');
      return `${hh}:${mm}`;
    }

    return text;
  }

  private mapRowToProfile(row: any): ProfileViewItem {
    return {
      id: String(row.profile_code || row.user_id || row.profile_id || ''),
      profileImage: row.profile_image_url || 'assets/default-avatar.png',
      galleryImages: this.normalizeGalleryImages(row),
      videoUrl: row.video_url || '',

      fullName: { en: row.full_name || '', ta: row.full_name_ta || row.full_name || '' },
gender: { en: row.gender_text || '', ta: row.gender_text === 'Male' ? 'ஆண்' : row.gender_text === 'Female' ? 'பெண்' : row.gender_text || '' },
      dob: row.dob || '',
      age: Number(row.age || 0),
     maritalStatus: {
  en: row.marital_status_text || '',
  ta: row.marital_status_text_ta || row.marital_status_text || ''
},
childrenStatus: row.children_status ?? false,
childrenDetails: row.children_details || '',
kalappuThirumanam: row.kalappu_thirumanam ?? false,
kalappuThirumanamDetails: {
  en: row.kalappu_thirumanam_details || '',
  ta: row.kalappu_thirumanam_details_ta || row.kalappu_thirumanam_details || ''
},
handicapStatus: row.handicap_status ?? row.handicap ?? false,
handicapDetails: {
  en: row.handicap_details || '',
  ta: row.handicap_details_ta || row.handicap_details || ''
},
subCaste: {
  en: row.sub_caste_text || row.sub_caste || '',
  ta:
    row.sub_caste_text_ta ||
    row.sub_caste_ta ||
    row.sub_caste_text ||
    row.sub_caste ||
    ''
},
mobile: row.mobile || '',
additionalMobile: row.additional_mobile || '',
email: row.email || '',
height: this.formatHeight(row),
weight: this.formatWeight(row),
religion: {
  en: row.religion_text || '',
  ta: row.religion_text_ta || row.religion_text || ''
},

caste: {
  en: row.caste_text || '',
  ta: row.caste_text_ta || row.caste_text || ''
},

fatherName: {
  en: row.father_name || '',
  ta: row.father_name_ta || row.father_name || ''
},

motherName: {
  en: row.mother_name || '',
  ta: row.mother_name_ta || row.mother_name || ''
},

fatherOccupation: {
  en: row.father_occupation_text || row.father_occupation || '',
  ta:
    row.father_occupation_ta ||
    row.father_occupation_text ||
    row.father_occupation ||
    ''
},

motherOccupation: {
  en: row.mother_occupation_text || row.mother_occupation || '',
  ta:
    row.mother_occupation_ta ||
    row.mother_occupation_text ||
    row.mother_occupation ||
    ''
},

siblings: {
  en: row.siblings_text || '',
  ta: row.siblings_ta || row.siblings_text || ''
},

marriedBrothers: row.married_brothers || '',
unmarriedBrothers: row.unmarried_brothers || '',
marriedSisters: row.married_sisters || '',
unmarriedSisters: row.unmarried_sisters || '',
kudumbaNilai: {
  en: row.kudumba_nilai || '',
  ta: row.kudumba_nilai_ta || row.kudumba_nilai || ''
},
poorvegam: {
  en: row.poorvegam || '',
  ta: row.poorvegam_ta || row.poorvegam || ''
},
iruppidam: {
  en: row.iruppidam || '',
  ta: row.iruppidam_ta || row.iruppidam || ''
},

education: {
  en: row.education_text || '',
  ta: row.education_text_ta || row.education_text || ''
},

job: {
  en: row.occupation_text || '',
  ta: row.occupation_text_ta || row.occupation_text || ''
},

company: {
  en: row.company_name || '',
  ta: row.company_name_ta || row.company_name || ''
},
workPlace: {
  en: row.work_place || '',
  ta: row.work_place_ta || row.work_place || ''
},
salary: this.formatSalary(row),
address: {
  en: row.address_line || '',
  ta: row.address_line_ta || row.address_line || ''
},

city: {
  en: row.city_text || '',
  ta: row.city_text_ta || row.city_text || ''
},

state: {
  en: row.state_text || '',
  ta: row.state_text_ta || row.state_text || ''
},

country: {
  en: row.country_text || '',
  ta: row.country_text_ta || row.country_text || ''
},
horoscopeImage: row.horoscope_file_url || '',
rasi: {
  en: row.rasi_text || '',
  ta: row.rasi_text_ta || row.rasi_text || ''
},

nakshatra: {
  en: row.nakshatra_text || '',
  ta: row.nakshatra_text_ta || row.nakshatra_text || ''
},

lagnam: {
  en: row.lagnam_text || '',
  ta: row.lagnam_text_ta || row.lagnam_text || ''
},
gothram: {
  en: row.gothram || '',
  ta: row.gothram_ta || row.gothram || ''
},

dhosham: {
  en: row.dhosham_text || '',
  ta: row.dhosham_text_ta || row.dhosham_text || ''
},

birthTime: row.birth_time || '',

birthPlace: {
  en: row.birth_place || '',
  ta: row.birth_place_ta || row.birth_place || ''
},
thisai: {
  en: row.thisai || '',
  ta: row.thisai_ta || row.thisai || ''
},

thisaiIruppu: {
  en: row.thisai_iruppu || '',
  ta: row.thisai_iruppu_ta || row.thisai_iruppu || ''
},

paatham: {
  en: row.paatham || '',
  ta: row.paatham_ta || row.paatham || ''
},

sothukal: {
  en: row.sothukal || '',
  ta: row.sothukal_ta || row.sothukal || ''
},

kuladeivam: {
  en: row.kuladeivam || '',
  ta: row.kuladeivam_ta || row.kuladeivam || ''
},
about: {
  en: row.about_me || '',
  ta: row.about_me_ta || row.about_me || ''
},

partnerExpectation: {
  en: row.partner_expectation || '',
  ta: row.partner_expectation_ta || row.partner_expectation || ''
},
noCastePreference:
  row.no_caste_preference === true ||
  row.no_caste_preference === 'true' ||
  row.no_caste_preference === 'Yes',

      rasiChart: this.toChartArray(row.rasi_chart),
      amsamChart: this.toChartArray(row.amsam_chart)
    };
  }

  private isNumericValue(value: string): boolean {
    return /^[0-9]+$/.test(value);
  }

  private isUuidValue(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  private getStoredLoggedInUser(): any | null {
    try {
      const raw = localStorage.getItem('matrimony_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private normalizeGender(value: string | null | undefined): string {
    return String(value || '').trim().toLowerCase();
  }

  private hasRequiredAstroData(row: any): boolean {
    return !!(
      row &&
      String(row.dob || '').trim() &&
      String(row.birth_time || '').trim() &&
      String(row.birth_place || '').trim()
    );
  }

async loadAstroMatch(): Promise<void> {
  try {
    this.astroMatch = null;

    const loggedInUser = this.getStoredLoggedInUser();

    if (!loggedInUser?.user_id) {
      console.log('NO LOGGED USER');
      return;
    }

    if (!this.loadedProfileRow) {
      console.log('NO VIEWED PROFILE');
      return;
    }

    const { data: myProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', loggedInUser.user_id)
      .maybeSingle();

    if (error) throw error;

    if (!myProfile) {
      console.log('MY PROFILE NOT FOUND');
      return;
    }

    const myGender = this.normalizeGender(myProfile.gender_text);
    const targetGender = this.normalizeGender(this.loadedProfileRow.gender_text);

    console.log('MY GENDER:', myGender);
    console.log('TARGET GENDER:', targetGender);

    if (!myGender || !targetGender) {
      this.snackbar.error('Gender missing for astrology match');
      return;
    }

    if (myGender === targetGender) {
      this.snackbar.error('Astrology match needs one male and one female profile');
      return;
    }

    if (!this.hasRequiredAstroData(myProfile)) {
      console.log('MY PROFILE ASTRO DATA MISSING', myProfile);
      this.snackbar.error('Please update your DOB, Birth Time and Birth Place');
      return;
    }

    if (!this.hasRequiredAstroData(this.loadedProfileRow)) {
      console.log('VIEWED PROFILE ASTRO DATA MISSING', this.loadedProfileRow);
      this.snackbar.error('Viewed profile DOB, Birth Time or Birth Place is missing');
      return;
    }

    const maleProfile =
      myGender === 'male' ? myProfile : this.loadedProfileRow;

    const femaleProfile =
      myGender === 'female' ? myProfile : this.loadedProfileRow;

    const malePayload = {
      date_of_birth: this.formatDateForApi(maleProfile.dob),
      time_of_birth: this.normalizeTimeForApi(maleProfile.birth_time),
      place: this.normalizePlaceForApi(maleProfile.birth_place)
    };

    const femalePayload = {
      date_of_birth: this.formatDateForApi(femaleProfile.dob),
      time_of_birth: this.normalizeTimeForApi(femaleProfile.birth_time),
      place: this.normalizePlaceForApi(femaleProfile.birth_place)
    };

    console.log('MALE PAYLOAD:', malePayload);
    console.log('FEMALE PAYLOAD:', femalePayload);

    const result = await this.astroService.getMatch(
      malePayload,
      femalePayload
    );

    console.log('PROKERALA RESULT:', result);

    this.astroMatch = result || null;
    this.cdr.detectChanges();

  } catch (error) {
    console.error('PROKERALA ERROR:', error);
    this.snackbar.error('Failed to load astrology match');
    this.astroMatch = null;
    this.cdr.detectChanges();
  }
}

  async loadProfile(): Promise<void> {
    this.isLoading = true;
    this.profile = null;
    this.astroMatch = null;
    this.loadedProfileRow = null;
    this.cdr.detectChanges();

    try {
      // if (!this.unlocked) {
      //   alert('Profile access not allowed');
      //   this.router.navigate(['/profiles']);
      //   return;
      // }

      if (!this.selectedProfileId) {
        this.snackbar.error('Profile ID missing');
        this.router.navigate(['/profiles']);
        return;
      }

      let data: any = null;
      let error: any = null;

      if (!this.isNumericValue(this.selectedProfileId) && !this.isUuidValue(this.selectedProfileId)) {
        const byProfileCode = await supabase
          .from('user_profiles')
          .select('*')
          .eq('profile_code', this.selectedProfileId)
          .maybeSingle();

        data = byProfileCode.data;
        error = byProfileCode.error;
      }

      if (!data && this.isUuidValue(this.selectedProfileId)) {
        const byUserId = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', this.selectedProfileId)
          .maybeSingle();

        data = byUserId.data;
        error = byUserId.error;
      }

      if (!data && this.isNumericValue(this.selectedProfileId)) {
        const byProfileId = await supabase
          .from('user_profiles')
          .select('*')
          .eq('profile_id', Number(this.selectedProfileId))
          .maybeSingle();

        data = byProfileId.data;
        error = byProfileId.error;
      }

      if (!data) {
        const fallback = await supabase
          .from('user_profiles')
          .select('*')
          .eq('profile_code', this.selectedProfileId)
          .maybeSingle();

        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        throw error;
      }

   

      if (!data) {
        this.snackbar.error('Profile ID missing');
        this.router.navigate(['/profiles']);
        return;
      }

this.loadedProfileRow = data;

this.profile = this.mapRowToProfile(data);

const loggedInUser =
  this.getStoredLoggedInUser();

if (
  loggedInUser?.user_id &&
  data?.profile_id
) {

  const { data: viewerProfile } =
    await supabase
      .from('user_profiles')
      .select('profile_id')
      .eq('user_id', loggedInUser.user_id)
      .maybeSingle();

  if (
    viewerProfile?.profile_id &&
    viewerProfile.profile_id !== data.profile_id
  ) {

    await supabase
  .from('profile_views')
  .upsert(
    {
      viewer_profile_id: viewerProfile.profile_id,
      viewed_profile_id: data.profile_id,
      viewed_at: new Date().toISOString()
    },
    {
      onConflict: 'viewer_profile_id,viewed_profile_id'
    }
  );

  }
}

if (this.currentLang === 'ta') {
  await this.translateProfileValuesToTamil();
}

await this.loadAstroMatch();
await this.checkInterest();
await this.checkShortlist();
    } catch (error: any) {
      
     this.snackbar.error(error?.message || 'Failed to load profile');
      this.router.navigate(['/profiles']);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  get fullLocation(): string {
    if (!this.profile) return '';

    return [
      this.getText(this.profile.city),
      this.getText(this.profile.state),
      this.getText(this.profile.country)
    ]
      .filter(Boolean)
      .join(', ');
  }

getText(value: string | LangText): string {
  if (typeof value === 'string') return value || '-';

  if (this.currentLang === 'ta') {
    return value?.ta || value?.en || '-';
  }

  return value?.en || value?.ta || '-';
}
yesNo(value: any): string {
  const isYes =
    value === true ||
    value === 'true' ||
    value === 'Yes' ||
    value === 'yes';

  return isYes
    ? (this.currentLang === 'ta' ? 'ஆம்' : 'Yes')
    : (this.currentLang === 'ta' ? 'இல்லை' : 'No');
}

isYes(value: any): boolean {
  return (
    value === true ||
    value === 'true' ||
    value === 'Yes' ||
    value === 'yes'
  );
}
  goBack(): void {
    this.router.navigate(['/profiles']);
  }

goToPlans(): void {
  if (!this.profile || !this.loadedProfileRow) return;

  this.router.navigate(['/plans'], { 
    queryParams: {
      from: 'profiles',
      profileId: this.loadedProfileRow.profile_id,
      profileCode: this.loadedProfileRow.profile_code,
      profileName: this.getText(this.profile.fullName)
    }
  });
}


goToLoginOrRegister(): void {
  const loggedInUser = this.getStoredLoggedInUser();

  if (!loggedInUser?.user_id) {
    this.snackbar.error(
      this.currentLang === 'ta'
        ? 'முதலில் லாகின் செய்யவும் அல்லது ரிஜிஸ்டர் செய்யவும்'
        : 'Please login or register first'
    );

    this.router.navigate(['/login'], {
      queryParams: {
        from: 'profile-view',
        profileId: this.selectedProfileId
      }
    });

    return;
  }

  this.goToPlans();
}
  async sendInterest(): Promise<void> {
    if (!this.profile) return;

    const loggedInUser = this.getStoredLoggedInUser();

    if (!loggedInUser?.user_id) {
     this.snackbar.error('Please login first');
      this.router.navigate(['/login']);
      return;
    }

    const { error } = await supabase
      .from('matrimony_interests')
      .insert({
        from_user_id: loggedInUser.user_id,
        to_profile_id: this.profile.id,
        status_code: 'pending'
      });

    if (error) {
      if (error.code === '23505') {
      if (error.code === '23505') {
  this.alreadySent = true;
  this.snackbar.error('You already sent interest to this profile');
  this.cdr.detectChanges();
  return;
}
        return;
      }

      
      this.snackbar.error('Failed to send interest');
      return;
    }

this.alreadySent = true;
this.interestStatus = 'pending';
this.snackbar.success('Interest sent successfully');
this.cdr.detectChanges();
  }

  async shortlistProfile(): Promise<void> {
    if (!this.profile) return;

    const loggedInUser = this.getStoredLoggedInUser();

    if (!loggedInUser?.user_id) {
      alert('Please login first');
      this.router.navigate(['/login']);
      return;
    }

    const { error } = await supabase
      .from('matrimony_shortlists')
      .insert({
        user_id: loggedInUser.user_id,
        profile_id: this.profile.id
      });

    if (error) {
      if (error.code === '23505') {
     if (error.code === '23505') {
  this.alreadyShortlisted = true;
  this.snackbar.error('This profile is already shortlisted');
  this.cdr.detectChanges();
  return;
}
        return;
      }

     
      this.snackbar.error('Failed to shortlist profile');
      return;
    }

  this.alreadyShortlisted = true;
this.snackbar.success('Profile shortlisted successfully');
this.cdr.detectChanges();
  }
async checkInterest() {
  const user = this.getStoredLoggedInUser();
  if (!user?.user_id || !this.profile) return;

  const { data } = await supabase
    .from('matrimony_interests')
    .select('id,status_code')
    .eq('from_user_id', user.user_id)
    .eq('to_profile_id', this.profile.id)
    .maybeSingle();

  this.alreadySent = !!data;
  this.interestStatus = data?.status_code || '';
  this.cdr.detectChanges();
}
async checkShortlist() {
  const user = this.getStoredLoggedInUser();
  if (!user?.user_id || !this.profile) return;

  const { data } = await supabase
    .from('matrimony_shortlists')
    .select('id')
    .eq('user_id', user.user_id)
    .eq('profile_id', this.profile.id)
    .maybeSingle();

  this.alreadyShortlisted = !!data;
  this.cdr.detectChanges();
}
async downloadProfile() {
  if (!this.unlocked) {
    this.snackbar.error('Please unlock this profile to download');
    return;
  }

  const html2canvas = await import('html2canvas');
  const jsPDF = await import('jspdf');

  const element = document.querySelector('.profile-view-page') as HTMLElement;

  if (!element) {
    this.snackbar.error('Profile not found');
    return;
  }

  element.classList.add('pdf-mode');
  this.showHoroscope = true;
this.cdr.detectChanges();

await new Promise(resolve => setTimeout(resolve, 300));

  const canvas = await html2canvas.default(element, {
    scale: 2,
    useCORS: true,
    scrollY: 0
  });

  element.classList.remove('pdf-mode');

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF.default('p', 'mm', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10;

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);

  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  // Watermark on every page
// Watermark on every page
const totalPages = pdf.getNumberOfPages();

for (let i = 1; i <= totalPages; i++) {
  pdf.setPage(i);

  // Watermark
  pdf.setFontSize(34);
  pdf.setTextColor(220, 220, 220);

  pdf.text('ASTRO ALLIANCE', 105, 150, {
    align: 'center',
    angle: 35
  });

  // Footer Details
//   pdf.setFontSize(9);
//   pdf.setTextColor(90, 90, 90);

//   pdf.text('Astro Alliance', 105, pageHeight - 18, {
//     align: 'center'
//   });

//   pdf.text(
//     'Email: support@astroalliance.in | Contact: +91 9876543210',
//     105,
//     pageHeight - 13,
//     {
//       align: 'center'
//     }
//   );

// pdf.text(
//   'Website: www.astroalliance.in',
//   105,
//   pageHeight - 8,
//   {
//     align: 'center'
//   }
// );
}

const fileName =
  `${this.getText(this.profile?.fullName || 'profile')}-Astro-Alliance.pdf`;

pdf.save(fileName.replace(/[^\w\-]+/g, '_'));

this.snackbar.success('Profile downloaded successfully');
}
}

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { App } from '../app';
import { supabase } from '../core/supabase.client';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '../shared/snackbar.service';

@Component({
  selector: 'app-biodata',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './biodata.html',
  styleUrls: ['./biodata.scss']
})
export class Biodata implements OnInit {
  app = inject(App);
  cdr = inject(ChangeDetectorRef);
  snackbar = inject(SnackbarService);
  route = inject(ActivatedRoute);
router = inject(Router);
editProfileId = '';

isBrowser = typeof window !== 'undefined';

isExtracting = false;
  isSaving = false;
  isSubmitted = false;
isEditMode = false;
maxDobDate = new Date().toISOString().split('T')[0];

poorvegamSearch = '';
showPoorvegamDropdown = false;
filteredPoorvegamList: any[] = [];

iruppidamSearch = '';
showIruppidamDropdown = false;
filteredIruppidamList: any[] = [];
  isLoadingProfile = false;
submitted = false;
fieldErrors: Record<string, boolean> = {};

isInvalid(field: string): boolean {
  return this.submitted && !!this.fieldErrors[field];
}
  private currentUserId: string | null = null;
isAdminCreated = false;
  private existingProfileImageUrl: string | null = null;
  private existingVideoUrl: string | null = null;
  private existingHoroscopeFileUrl: string | null = null;
  private existingLatitude: number | null = null;
  private existingLongitude: number | null = null;

  translations = {
    en: {
      banner: {
        title: 'Create Your Biodata',
        subtitle: 'Fill your profile details beautifully and professionally',
        badge: 'Matrimony Profile'
      },
      sections: {
        profilePhoto: 'Profile Photo',
        profilePhotoSub: 'Upload a clear profile picture',
        gallery: 'Additional Images & Video',
        gallerySub: 'Upload extra profile photos and one video',
        personal: 'Personal Details',
        personalSub: 'Basic information about the bride or groom',
        family: 'Family Details',
        familySub: 'Family background and information',
        education: 'Education & Career',
        educationSub: 'Academic and professional details',
        address: 'Address Details',
        addressSub: 'Current living location',
        horoscopeUpload: 'Upload Horoscope',
        horoscopeUploadSub: 'Upload image or PDF and auto fill horoscope details',
        horoscopeDetails: 'Horoscope Details',
        horoscopeDetailsSub: 'Astrology details for matrimony profile'
      },
      labels: {
        chooseImage: 'Choose Image',
        remove: 'Remove',
        uploadPhoto: 'Upload Photo',
        uploadNote: 'JPG, PNG supported',
        chooseImages: 'Choose Additional Images',
        chooseVideo: 'Choose Video',
        removeAll: 'Remove All',
        videoNote: 'MP4, MOV, AVI supported',
        imageNote: 'You can upload multiple images',
        fullName: 'Full Name',
        gender: 'Gender',
        selectGender: 'Select Gender',
        dob: 'Date of Birth',
        age: 'Age',
        agePlaceholder: 'Auto calculated',
        maritalStatus: 'Marital Status',
        selectStatus: 'Select Status',
        mobile: 'Mobile',
        email: 'Email',
        height: 'Height',
        weight: 'Weight',
        religion: 'Religion',
        caste: 'Caste',
        fatherName: 'Father Name',
        motherName: 'Mother Name',
        fatherOccupation: 'Father Occupation',
        motherOccupation: 'Mother Occupation',
        siblings: 'Siblings',
        education: 'Education',
        occupation: 'Occupation',
        company: 'Company',
        salary: 'Salary',
        address: 'Address',
        city: 'District',
        state: 'State',
        country: 'Country',
        selectHoroscope: 'Select Horoscope File',
        autoFill: 'Auto Fill Horoscope',
        extracting: 'Extracting...',
        selected: 'Selected',
        rasi: 'Rasi',
        nakshatra: 'Nakshatra',
        lagnam: 'Lagnam',
        gothram: 'Gothram',
        dhosham: 'Dhosham',
        birthTime: 'Birth Time',
        birthPlace: 'Birth Place',
        selectRasi: 'Select Rasi',
        selectNakshatra: 'Select Nakshatra',
        selectLagnam: 'Select Lagnam',
        selectDhosham: 'Select Dhosham',
      submit: 'Submit Biodata',
saving: 'Saving...',
additionalMobile: 'Additional Phone Number',
searchEducation: 'Search education',
add: 'Add',
required: 'Required',subCaste: 'Sub Caste',
brothers: 'Brothers',
sisters: 'Sisters',

handicap: 'Physically Challenged',
handicapDetails: 'Handicap Details',

children: 'Children',
childrenDetails: 'Children Details',
      },
      placeholders: {
        fullName: 'Enter full name',
        mobile: 'Enter mobile number',
        email: 'Enter email',
        height: 'Example: 5.6',
        weight: 'Enter weight',
        religion: 'Enter religion',
        caste: 'Enter caste',
        fatherName: 'Enter father name',
        motherName: 'Enter mother name',
        fatherOccupation: 'Enter father occupation',
        motherOccupation: 'Enter mother occupation',
        siblings: 'Enter siblings details',
        education: 'Enter education',
        occupation: 'Enter occupation',
        company: 'Enter company name',
        workPlace: 'Enter work place',
        salary: 'Enter salary',
        address: 'Enter address',
        city: 'Enter city',
        state: 'Enter state',
        country: 'Enter country',
        gothram: 'Enter gothram',
        birthPlace: 'Enter birth place'
      },
      options: {
       
      },
      alerts: {
        uploadHoroscopeFirst: 'Please upload a horoscope file first.',
        horoscopeFilled: 'Horoscope details filled successfully.',
        horoscopeFailed: 'Failed to extract horoscope details.',
        biodataSubmitted: 'Biodata submitted successfully!',
        loginRequired: 'Please login first.',
        profileLoadFailed: 'Unable to load biodata.'
      }
    },
    ta: {
      banner: {
        title: 'உங்கள் பயோடேட்டாவை உருவாக்குங்கள்',
        subtitle: 'உங்கள் சுயவிவர விவரங்களை அழகாகவும் தொழில்முறையாகவும் நிரப்புங்கள்',
        badge: 'மேட்ரிமோனி சுயவிவரம்'
      },
      sections: {
        profilePhoto: 'சுயவிவர புகைப்படம்',
        profilePhotoSub: 'தெளிவான சுயவிவரப் படத்தை பதிவேற்றவும்',
        gallery: 'கூடுதல் படங்கள் மற்றும் வீடியோ',
        gallerySub: 'கூடுதல் சுயவிவரப் படங்களையும் ஒரு வீடியோவையும் பதிவேற்றவும்',
        personal: 'தனிப்பட்ட விவரங்கள்',
        personalSub: 'மணமகன் அல்லது மணமகளின் அடிப்படை தகவல்கள்',
        family: 'குடும்ப விவரங்கள்',
        familySub: 'குடும்ப பின்னணி மற்றும் தகவல்கள்',
        education: 'கல்வி மற்றும் தொழில்',
        educationSub: 'கல்வி மற்றும் தொழில் தொடர்பான விவரங்கள்',
        address: 'முகவரி விவரங்கள்',
        addressSub: 'தற்போதைய இருப்பிடம்',
        horoscopeUpload: 'ஜாதகத்தை பதிவேற்றவும்',
        horoscopeUploadSub: 'படம் அல்லது PDF பதிவேற்றி ஜாதக விவரங்களை தானாக நிரப்பவும்',
        horoscopeDetails: 'ஜாதக விவரங்கள்',
        horoscopeDetailsSub: 'மேட்ரிமோனி சுயவிவரத்திற்கான ஜோதிட விவரங்கள்'
      },
      labels: {
        chooseImage: 'படத்தை தேர்வு செய்யவும்',
        remove: 'அகற்று',
        uploadPhoto: 'புகைப்படம் பதிவேற்று',
        uploadNote: 'JPG, PNG ஆதரவு',
        chooseImages: 'கூடுதல் படங்களை தேர்வு செய்யவும்',
        chooseVideo: 'வீடியோவை தேர்வு செய்யவும்',
        removeAll: 'அனைத்தையும் அகற்று',
        videoNote: 'MP4, MOV, AVI ஆதரவு',
        imageNote: 'பல படங்களை பதிவேற்றலாம்',
        fullName: 'முழு பெயர்',
        gender: 'பாலினம்',
        selectGender: 'பாலினத்தை தேர்வு செய்யவும்',
        dob: 'பிறந்த தேதி',
        age: 'வயது',
        agePlaceholder: 'தானாக கணக்கிடப்படும்',
        maritalStatus: 'திருமண நிலை',
        selectStatus: 'நிலையை தேர்வு செய்யவும்',
        mobile: 'மொபைல்',
        email: 'மின்னஞ்சல்',
        height: 'உயரம்',
        weight: 'எடை',
        religion: 'மதம்',
        caste: 'ஜாதி',
        fatherName: 'தந்தை பெயர்',
        motherName: 'தாய் பெயர்',
        fatherOccupation: 'தந்தையின் தொழில்',
        motherOccupation: 'தாயின் தொழில்',
        siblings: 'உடன்பிறப்புகள்',
        education: 'கல்வி',
        occupation: 'தொழில்',
        company: 'நிறுவனம்',
        workPlace: 'பணியிடம்',
        salary: 'சம்பளம்',
        address: 'முகவரி',
        city: 'மாவட்டம்',
        state: 'மாநிலம்',
        country: 'நாடு',
        selectHoroscope: 'ஜாதக கோப்பை தேர்வு செய்யவும்',
        autoFill: 'ஜாதகத்தை தானாக நிரப்பவும்',
        extracting: 'எடுக்கப்படுகிறது...',
        selected: 'தேர்ந்தெடுக்கப்பட்டது',
        rasi: 'ராசி',
        nakshatra: 'நட்சத்திரம்',
        lagnam: 'லக்னம்',
        gothram: 'கோத்ரம்',
        dhosham: 'தோஷம்',
        birthTime: 'பிறந்த நேரம்',
        birthPlace: 'பிறந்த இடம்',
        selectRasi: 'ராசியை தேர்வு செய்யவும்',
        selectNakshatra: 'நட்சத்திரத்தை தேர்வு செய்யவும்',
        selectLagnam: 'லக்னத்தை தேர்வு செய்யவும்',
        selectDhosham: 'தோஷத்தை தேர்வு செய்யவும்',
       submit: 'பயோடேட்டாவை சமர்ப்பிக்கவும்',
saving: 'சேமிக்கப்படுகிறது...',
additionalMobile: 'கூடுதல் தொலைபேசி எண்',
searchEducation: 'கல்வியை தேடவும்',
add: 'சேர்',
required: 'தேவை',
subCaste: 'உட்பிரிவு',

brothers: 'சகோதரர்கள்',
sisters: 'சகோதரிகள்',

handicap: 'மாற்றுத்திறனாளி',
handicapDetails: 'விவரம்',

children: 'குழந்தைகள்',
childrenDetails: 'குழந்தைகள் விவரம்',
      },
      placeholders: {
        fullName: 'முழு பெயரை உள்ளிடவும்',
        mobile: 'மொபைல் எண்ணை உள்ளிடவும்',
        email: 'மின்னஞ்சலை உள்ளிடவும்',
        height: 'உதாரணம்: 5.6',
        weight: 'எடையை உள்ளிடவும்',
        religion: 'மதத்தை உள்ளிடவும்',
        caste: 'ஜாதியை உள்ளிடவும்',
        fatherName: 'தந்தை பெயரை உள்ளிடவும்',
        motherName: 'தாய் பெயரை உள்ளிடவும்',
        fatherOccupation: 'தந்தையின் தொழிலை உள்ளிடவும்',
        motherOccupation: 'தாயின் தொழிலை உள்ளிடவும்',
        siblings: 'உடன்பிறப்புகள் விவரங்களை உள்ளிடவும்',
        education: 'கல்வியை உள்ளிடவும்',
        occupation: 'தொழிலை உள்ளிடவும்',
        company: 'நிறுவனப் பெயரை உள்ளிடவும்',
        workPlace: 'பணியிடத்தை உள்ளிடவும்',
        salary: 'சம்பளத்தை உள்ளிடவும்',
        address: 'முகவரியை உள்ளிடவும்',
        city: 'நகரத்தை உள்ளிடவும்',
        state: 'மாநிலத்தை உள்ளிடவும்',
        country: 'நாட்டை உள்ளிடவும்',
        gothram: 'கோத்ரத்தை உள்ளிடவும்',
        birthPlace: 'பிறந்த இடத்தை உள்ளிடவும்'
      },
      options: {
     
      },
      alerts: {
        uploadHoroscopeFirst: 'முதலில் ஜாதக கோப்பை பதிவேற்றவும்.',
        horoscopeFilled: 'ஜாதக விவரங்கள் வெற்றிகரமாக நிரப்பப்பட்டன.',
        horoscopeFailed: 'ஜாதக விவரங்களை எடுக்க முடியவில்லை.',
        biodataSubmitted: 'பயோடேட்டா வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
        loginRequired: 'முதலில் உள்நுழைக.',
        profileLoadFailed: 'பயோடேட்டாவை ஏற்ற முடியவில்லை.'
      }
    }
  };

  formData = {
    additionalMobile: [''],
    fullName: '',
    gender: '',
    dob: '',
    age: '',
  maritalStatus: '',
secondMarriageReason: '',
mobile: '',
    email: '',
   height: '',
weight: '',
colorId: '',
color: '',
religion: '',
    caste: '',
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    siblings: '',
    education: '',
    otherEducation: '',
    job: '',
    otherProfession: '',
    company: '',
    workPlace: '',
    salary: '',
    address: '',
    city: '',
    state: '',
    country: '',
    rasi: '',
    nakshatra: '',
    lagnam: '',
    gothram: '',
    dhosham: '',
    birthTime: '',
    birthPlace: '',
    aboutMe: '',
    partnerExpectation: '',
    subCaste: '',

marriedBrothers: '',
unmarriedBrothers: '',

marriedSisters: '',
unmarriedSisters: '',
handicapStatus: 'No',
handicapDetails: '',

childrenStatus: 'No',
childrenDetails: '',

kalappuThirumanam: 'No',
kalappuThirumanamDetails: '',
thisai: '',
thisaiIruppu: '',
thisaiYear: '',
thisaiMonth: '',
thisaiDay: '',
paatham: '',
sothukal: '',
poorvegam: '',
iruppidam: '',
kuladeivam: '',
kudumbaNilaiId: '',
kudumbaNilai: '',
  };
formDataTa = {
  fullName: '',
  gothram: '',
  salary: '',
  fatherName: '',
  motherName: '',
  fatherOccupation: '',
  motherOccupation: '',
  siblings: '',
  job: '',
  company: '',
  workPlace: '',
  address: '',
  birthPlace: '',
  aboutMe: '',
  partnerExpectation: '',
  subCaste: '',
handicapDetails: '',
childrenDetails: '',
thisai: '',
thisaiIruppu: '',
paatham: '',
sothukal: '',
poorvegam: '',
iruppidam: '',
kuladeivam: '',
kalappuThirumanamDetails: '',
kudumbaNilai: '',
};

kudumbaNilaiOptions = [
  { en: 'Middle Class', ta: 'நடுத்தர குடும்பம்' },
  { en: 'Upper Middle Class', ta: 'உயர் நடுத்தர குடும்பம்' },
  { en: 'Rich', ta: 'பணக்கார குடும்பம்' },
  { en: 'Poor', ta: 'ஏழ்மை குடும்பம்' },
  { en: 'Traditional', ta: 'பாரம்பரிய குடும்பம்' },
  { en: 'Orthodox', ta: 'ஆசாரமான குடும்பம்' }
];
  horoscopeHints = [
    { no: 1, label: 'வியாழன்' },
    { no: 2, label: 'கேது' },
    { no: 3, label: 'லக்னம்' },
    { no: 4, label: 'செவ்வாய்' },
    { no: 5, label: 'புதன்' },
    { no: 6, label: 'சந்திரன்' },
    { no: 7, label: 'ராகு' },
    { no: 8, label: 'சனி' },
    { no: 9, label: 'சூரியன்' },
    { no: 10, label: 'சுக்கிரன்' },
    { no: 11, label: 'மாந்தி' },
    { no: 12, label: 'வகரம்' }
  ];

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

rasiChart: string[] = Array(12).fill('');
amsamChart: string[] = Array(12).fill('');


  selectedProfileImage: File | null = null;
  profilePreviewUrl: string | null = null;
  additionalImages: File[] = [];
  additionalImagePreviews: string[] = [];

  selectedVideo: File | null = null;
  videoPreviewUrl: string | null = null;

  selectedHoroscopeFile: File | null = null;
  horoscopePreviewUrl: string | null = null;
  casteList: any[] = [];
religionList: any[] = [];
genderList: any[] = [];
maritalStatusList: any[] = [];
colorList: any[] = [];
kudumbaNilaiList: any[] = [];
  dhoshamDbList: any[] = [];
  rasiDbList: any[] = [];
nakshatraDbList: any[] = [];
lagnamDbList: any[] = [];
  thisaiIruppuList: any[] = [];
  thisaiList: any[] = [];
allCastes: any[] = [];
selectedReligionId = '';
countryList: any[] = [];

allStates: any[] = [];
stateList: any[] = [];

allCities: any[] = [];
cityList: any[] = [];

selectedCountryId = '';
selectedStateId = '';
selectedCityId = '';
isOtherCountrySelected(): boolean {
  const country = this.countryList.find(
    (c: any) => c.country_id === this.selectedCountryId
  );

  return country?.country_name?.toLowerCase() === 'other';
}
formatDob(event: any) {

  let value = event.target.value.replace(/\D/g, '');

  if (value.length > 2) {
    value =
      value.substring(0, 2) +
      '-' +
      value.substring(2);
  }

  if (value.length > 5) {
    value =
      value.substring(0, 5) +
      '-' +
      value.substring(5, 9);
  }

  this.formData.dob = value;
  this.onDobChange();
}
formatBirthTime(event: any): void {
  let value = event.target.value.toUpperCase();

  value = value.replace(/[^0-9APM: ]/g, '');

  this.formData.birthTime = value;
}

onBirthTimePick(event: any): void {
  const value = event.target.value;

  if (!value) return;

  const [hourStr, minute] = value.split(':');

  let hour = Number(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;
  hour = hour ? hour : 12;

  this.formData.birthTime =
    `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}
onMobileDatePick(event: any) {

  const value = event.target.value;

  if (!value) return;

  const [year, month, day] =
    value.split('-');

  this.formData.dob =
    `${day}-${month}-${year}`;

  this.onDobChange();
}
isOtherStateSelected(): boolean {
  const state = this.stateList.find(
    (s: any) => s.state_id === this.selectedStateId
  );

  return state?.state_name?.toLowerCase() === 'other';
}

isOtherCitySelected(): boolean {
  const city = this.cityList.find(
    (c: any) => c.city_id === this.selectedCityId
  );

  return city?.city_name?.toLowerCase() === 'other';
}

onCityChange(): void {

  const city = this.cityList.find(
    (c: any) => c.city_id === this.selectedCityId
  );

  this.formData.city = city?.city_name || '';
}
educationList: any[] = [];
filteredEducationList: any[] = [];
professionList: any[] = [];
educationSearch = '';
showEducationDropdown = false;
 get currentLang(): 'en' | 'ta' {

  if (typeof window === 'undefined') {
    return 'en';
  }

  return (
    localStorage.getItem('tm_language') as 'en' | 'ta'
  ) || 'en';
}
addAdditionalMobile(): void {

  this.formData.additionalMobile.push('');

}
removeAdditionalMobile(index: number): void {

  if (this.formData.additionalMobile.length === 1) {
    this.formData.additionalMobile[0] = '';
    return;
  }

  this.formData.additionalMobile.splice(index, 1);
}
  get tr() {
    return this.translations[this.currentLang];
  }
 isAdminTanglishEnabled(): boolean {
  if (!this.isBrowser) return false;

  const isAdminPage =
    this.route.snapshot.queryParamMap.get('adminCreate') === 'true';

  return (
    isAdminPage &&
    localStorage.getItem('admin_tanglish_enabled') === '1'
  );
}

  readonly horoscopeValueMap: any = {
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
  },

  dhosham: {
    No: 'இல்லை',
    Yes: 'உண்டு',
    'Dont Know': 'தெரியாது'
  }
};

getTamilValue(

  type: 'rasi' | 'nakshatra' | 'lagnam' | 'dhosham',
  value: string
): string {

  if (this.currentLang !== 'ta') {
    return value;
  }

  if (type === 'lagnam') {
    return this.horoscopeValueMap.rasi[value] || value;
  }

  return this.horoscopeValueMap[type]?.[value] || value;
}
async translateText(text: string, target: 'ta' | 'en' = 'ta'): Promise<string> {

  if (!text || !text.trim()) {
    return text;
  }
const localMap: any = {

  'nil': 'இல்லை',
  'house wife': 'வீட்டு மனைவி',
  '1 brother': '1 சகோதரர்',
  '2 brothers': '2 சகோதரர்கள்',
  '1 sister': '1 சகோதரி',
  '2 sisters': '2 சகோதரிகள்',

};

const lower = text.trim().toLowerCase();

if (target === 'ta' && localMap[lower]) {
  return localMap[lower];
}
  try {

    const { data, error } =
      await supabase.functions.invoke(
        'translate-text',
        {
          body: {
            text,
           target: target
          }
        }
      );

    if (error) {
    
      return text;
    }

    return data?.translatedText || text;

  } catch (e) {

    

    return text;

  }

}

// async translateFormToTamil(): Promise<void> {
// alert('Biodata translating');
//   this.formData.fullName =
//     await this.translateText(this.formData.fullName);

//   this.formData.fatherName =
//     await this.translateText(this.formData.fatherName);

//   this.formData.motherName =
//     await this.translateText(this.formData.motherName);

//   this.formData.fatherOccupation =
//     await this.translateText(this.formData.fatherOccupation);

//   this.formData.motherOccupation =
//     await this.translateText(this.formData.motherOccupation);

//   this.formData.siblings =
//     await this.translateText(this.formData.siblings);

//   this.formData.job =
//     await this.translateText(this.formData.job);

//   this.formData.company =
//     await this.translateText(this.formData.company);



//  this.formData.gothram =
//     await this.translateText(this.formData.gothram);

//   this.formData.birthPlace =
//     await this.translateText(this.formData.birthPlace);

//   this.formData.aboutMe =
//     await this.translateText(this.formData.aboutMe);

//   this.formData.partnerExpectation =
//     await this.translateText(this.formData.partnerExpectation);



//   this.cdr.detectChanges();

// }

getTypedValue(field: keyof typeof this.formDataTa): string {
  if (this.currentLang === 'ta') {
    return this.formDataTa[field] || '';
  }

  return (this.formData as any)[field] || '';
}
tamilKeypress(event: KeyboardEvent): void {
  if (!this.isAdminTanglishEnabled()) {
    return;
  }

  if (this.currentLang !== 'ta') {
    return;
  }

  const convertThis = (window as any).convertThis;

  if (typeof convertThis !== 'function') {
    return;
  }

  convertThis(event);

  setTimeout(() => {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    this.cdr.detectChanges();
  }, 0);
}
onTamilInputChange(
  field: keyof typeof this.formDataTa,
  value: string
): void {

  if (this.currentLang === 'ta') {
    this.formDataTa[field] = value;
    (this.formData as any)[field] = value;
  } else {
    (this.formData as any)[field] = value;
  }
}
async prepareTamilValues(): Promise<void> {
  this.cdr.detectChanges();
}
getTamilEducationName(value: string): string {

  if (!value) return '';

  const edu = this.educationList.find(
    (e: any) => e.education_name === value
  );

  return edu?.education_name_ta || value;

}
async prepareEnglishValues(): Promise<void> {

const convert = async (taValue: string, enValue: string) => {

  if (!taValue || !taValue.trim()) {
    return enValue;
  }

  // do not translate english names
  return taValue;

};

  this.formData.fullName =
  this.formDataTa.fullName || this.formData.fullName;
  this.formData.fatherName = await convert(this.formDataTa.fatherName, this.formData.fatherName);
  this.formData.motherName = await convert(this.formDataTa.motherName, this.formData.motherName);
  this.formData.fatherOccupation = await convert(this.formDataTa.fatherOccupation, this.formData.fatherOccupation);
  this.formData.motherOccupation = await convert(this.formDataTa.motherOccupation, this.formData.motherOccupation);
  this.formData.siblings = await convert(this.formDataTa.siblings, this.formData.siblings);
  // this.formData.job = await convert(this.formDataTa.job, this.formData.job);
  this.formData.company = await convert(this.formDataTa.company, this.formData.company);
  this.formData.workPlace =
  await convert(this.formDataTa.workPlace, this.formData.workPlace);
 if (this.currentLang === 'ta') {
  this.formData.address = this.formDataTa.address || this.formData.address;
}
  this.formData.birthPlace = await convert(this.formDataTa.birthPlace, this.formData.birthPlace);
  this.formData.aboutMe = await convert(this.formDataTa.aboutMe, this.formData.aboutMe);
  this.formData.partnerExpectation = await convert(this.formDataTa.partnerExpectation, this.formData.partnerExpectation);
this.formData.salary = await convert(this.formDataTa.salary, this.formData.salary);

this.formData.gothram = await convert(this.formDataTa.gothram, this.formData.gothram);
this.formData.subCaste =
  await convert(
    this.formDataTa.subCaste,
    this.formData.subCaste
  );

this.formData.handicapDetails =
  await convert(
    this.formDataTa.handicapDetails,
    this.formData.handicapDetails
  );
this.formData.childrenDetails =
  await convert(
    this.formDataTa.childrenDetails,
    this.formData.childrenDetails
  );
this.formData.thisai =
  await convert(
    this.formDataTa.thisai,
    this.formData.thisai
  );

this.formData.thisaiIruppu =
  await convert(
    this.formDataTa.thisaiIruppu,
    this.formData.thisaiIruppu
  );

this.formData.paatham =
  await convert(
    this.formDataTa.paatham,
    this.formData.paatham
  );

this.formData.sothukal =
  await convert(
    this.formDataTa.sothukal,
    this.formData.sothukal
  );

this.formData.poorvegam =
  await convert(
    this.formDataTa.poorvegam,
    this.formData.poorvegam
  );

this.formData.iruppidam =
  await convert(
    this.formDataTa.iruppidam,
    this.formData.iruppidam
  );

this.formData.kuladeivam =
  await convert(
    this.formDataTa.kuladeivam,
    this.formData.kuladeivam
  );
  this.formData.kudumbaNilai =
  await convert(
    this.formDataTa.kudumbaNilai,
    this.formData.kudumbaNilai
  );
  this.formData.kalappuThirumanamDetails =
  await convert(
    this.formDataTa.kalappuThirumanamDetails,
    this.formData.kalappuThirumanamDetails
  );
}
async onLanguageSwitch(lang: 'en' | 'ta'): Promise<void> {
  if (lang === 'en') {
    await this.prepareEnglishValues();
  }

  if (lang === 'ta') {
    await this.prepareAutoTamilValues();
  }

  this.app.currentLang = lang;
  this.cdr.detectChanges();
}
async prepareAutoTamilValues(): Promise<void> {
  const convert = async (enValue: string, taValue: string) => {
    if (taValue && taValue.trim()) return taValue;
    if (!enValue || !enValue.trim()) return '';
   return enValue;
  };

  this.formDataTa.fullName = await convert(this.formData.fullName, this.formDataTa.fullName);
  this.formDataTa.fatherName = await convert(this.formData.fatherName, this.formDataTa.fatherName);
  this.formDataTa.motherName = await convert(this.formData.motherName, this.formDataTa.motherName);
  this.formDataTa.fatherOccupation = await convert(this.formData.fatherOccupation, this.formDataTa.fatherOccupation);
  this.formDataTa.motherOccupation = await convert(this.formData.motherOccupation, this.formDataTa.motherOccupation);
  this.formDataTa.siblings = await convert(this.formData.siblings, this.formDataTa.siblings);
  this.formDataTa.job = await convert(this.formData.job, this.formDataTa.job);
  this.formDataTa.company = await convert(this.formData.company, this.formDataTa.company);
  this.formDataTa.workPlace =
  await convert(this.formData.workPlace, this.formDataTa.workPlace);
  this.formDataTa.address = await convert(this.formData.address, this.formDataTa.address);
  this.formDataTa.birthPlace = await convert(this.formData.birthPlace, this.formDataTa.birthPlace);
  this.formDataTa.aboutMe = await convert(this.formData.aboutMe, this.formDataTa.aboutMe);
  this.formDataTa.partnerExpectation = await convert(this.formData.partnerExpectation, this.formDataTa.partnerExpectation);
  this.formDataTa.salary = await convert(this.formData.salary, this.formDataTa.salary);

this.formDataTa.gothram = await convert(this.formData.gothram, this.formDataTa.gothram);
this.formDataTa.kudumbaNilai =
  await convert(
    this.formData.kudumbaNilai,
    this.formDataTa.kudumbaNilai
  );
  this.formDataTa.kalappuThirumanamDetails =
  await convert(
    this.formData.kalappuThirumanamDetails,
    this.formDataTa.kalappuThirumanamDetails
  );
}
onChartInput(
  type: 'rasi' | 'amsam',
  index: number,
  event: Event
): void {

  const input = event.target as HTMLTextAreaElement;
  let value = input.value.trim();

  if (!value) {
    input.value = '';
    type === 'rasi'
      ? this.rasiChart[index] = ''
      : this.amsamChart[index] = '';
    return;
  }

  const tamilToNumber = Object.entries(this.planetShortMap)
    .sort((a, b) => b[1].length - a[1].length);

  tamilToNumber.forEach(([num, tamil]) => {
    value = value.replaceAll(tamil, num);
  });

  value = value.replace(/[^0-9/]/g, '');

  const finalValue = value
    .split('/')
    .map(v => v.trim())
    .map(num => num ? (this.planetShortMap[num] || num) : '')
    .join('/');

  input.value = finalValue;

  type === 'rasi'
    ? this.rasiChart[index] = finalValue
    : this.amsamChart[index] = finalValue;
}
onChartKeydown(
  type: 'rasi' | 'amsam',
  index: number,
  event: KeyboardEvent
): void {

  if (event.key !== 'Backspace' && event.key !== 'Delete') {
    return;
  }

  const input = event.target as HTMLTextAreaElement;
  const value = input.value;

  const start = input.selectionStart ?? value.length;
  const end = input.selectionEnd ?? value.length;

  // only handle normal single-cursor delete
  if (start !== end) return;

  const planetValues = Object.values(this.planetShortMap)
    .sort((a, b) => b.length - a.length);

  // BACKSPACE: delete full planet before cursor
  if (event.key === 'Backspace') {
    const beforeCursor = value.substring(0, start);

    const matched = planetValues.find(p => beforeCursor.endsWith(p));

    if (matched) {
      event.preventDefault();

      const newValue =
        value.substring(0, start - matched.length) +
        value.substring(start);

      input.value = newValue;

      if (type === 'rasi') this.rasiChart[index] = newValue;
      else this.amsamChart[index] = newValue;
    }
  }

  // DELETE: delete full planet after cursor
  if (event.key === 'Delete') {
    const afterCursor = value.substring(start);

    const matched = planetValues.find(p => afterCursor.startsWith(p));

    if (matched) {
      event.preventDefault();

      const newValue =
        value.substring(0, start) +
        value.substring(start + matched.length);

      input.value = newValue;

      if (type === 'rasi') this.rasiChart[index] = newValue;
      else this.amsamChart[index] = newValue;
    }
  }
}
  getPlanetShort(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return this.planetShortMap[String(value)] || '';
  }

  private safeText(value: any): string {
    return value && String(value).trim() !== '' ? String(value).trim() : '';
  }

  private safeNumber(value: any): number | null {
    if (!value || String(value).trim() === '') return null;
    const cleaned = String(value).replace(/[^0-9.]/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  private buildLocationQuery(): string {
    return [
      this.safeText(this.formData.address),
      this.safeText(this.formData.city),
      this.safeText(this.formData.state),
      this.safeText(this.formData.country)
    ]
      .filter((v) => v !== '')
      .join(', ');
  }

  private async getLatLngFromLocation(): Promise<{ lat: number | null; lng: number | null }> {
    const query = this.buildLocationQuery();

    if (!query) {
      return { lat: null, lng: null };
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        {
          headers: {
            Accept: 'application/json'
          }
        }
      );

      if (!response.ok) {
       
        return { lat: null, lng: null };
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const lat = Number(data[0]?.lat);
        const lng = Number(data[0]?.lon);

        return {
          lat: Number.isFinite(lat) ? lat : null,
          lng: Number.isFinite(lng) ? lng : null
        };
      }
    } catch (error) {
      
    }

    return { lat: null, lng: null };
  }
  async loadRasiList(): Promise<void> {
  const { data, error } = await supabase
    .from('mst_rasi')
    .select('rasi_id, rasi_name, rasi_name_ta, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!error) this.rasiDbList = data || [];
}

async loadNakshatraList(): Promise<void> {
  const { data, error } = await supabase
    .from('mst_nakshatra')
    .select('nakshatra_id, nakshatra_name, nakshatra_name_ta, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!error) this.nakshatraDbList = data || [];
}

async loadLagnamList(): Promise<void> {
  const { data, error } = await supabase
    .from('mst_lagnam')
    .select('lagnam_id, lagnam_name, lagnam_name_ta, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!error) this.lagnamDbList = data || [];
}
async ngOnInit(): Promise<void> {

const editId = this.route.snapshot.queryParamMap.get('id');

if (editId && editId !== 'new') {
  this.isEditMode = true;
  this.editProfileId = editId;
}
  if (this.isBrowser) {
    (window as any).activeBiodataComponent = this;

    const adminCreatedUserId =
      localStorage.getItem('admin_created_user_id');

   const isAdminCreatePage =
  this.route.snapshot.queryParamMap.get('adminCreate') === 'true';

if (isAdminCreatePage) {

  if (!editId) {
    this.currentUserId = adminCreatedUserId || null;
  }

  this.isAdminCreated = true;

}
  }

await this.loadGenders();
await this.loadReligions();
await this.loadMaritalStatuses();
await this.loadColors();
await this.loadKudumbaNilai();
await this.loadThisaiIruppu();
  await this.loadCastes();
  await this.loadCountries();
  await this.loadStates();
  await this.loadCities();
  await this.loadEducationLevels();
  await this.loadProfessionList();
await this.loadDhoshamList();
await this.loadRasiList();
await this.loadNakshatraList();
await this.loadLagnamList();
  await this.loadExistingBiodata();


  if (this.currentLang === 'ta') {
    await this.prepareTamilValues();
  }
//   setTimeout(() => {
//   this.loadGoogleTamilTyping();
// }, 1000);
}
  private getStoredLoggedInUser(): any | null {
    if (!this.isBrowser) return null;

    try {
      const raw = localStorage.getItem('matrimony_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private getAdminCreatedUserId(): string {
  if (!this.isBrowser) return '';
  return localStorage.getItem('admin_created_user_id') || '';
}

  private async resolveCurrentUserId(): Promise<string | null> {
    if (this.currentUserId) {
  return this.currentUserId;
}
    const loggedInUser = this.getStoredLoggedInUser();

    if (loggedInUser?.user_id) {
      return loggedInUser.user_id;
    }

const storedAppUserId = this.isBrowser
  ? localStorage.getItem('app_user_id')
  : null;
      if (storedAppUserId) {
      return storedAppUserId;
    }

    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (!error && user?.id) {
      const { data: appUser } = await supabase
        .from('app_users')
        .select('user_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (appUser?.user_id) {
        return appUser.user_id;
      }
    }

    return null;
  }

  async loadExistingBiodata(): Promise<void> {
    this.isLoadingProfile = true;
if (this.isAdminCreated && !this.editProfileId) {
  this.isLoadingProfile = false;
  return;
}
    try {
     const userId = await this.resolveCurrentUserId();

if (!userId && !this.editProfileId) {

  this.isLoadingProfile = false;

  return;

}

if (userId) {

  this.currentUserId = userId;

}
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq(
  this.editProfileId
    ? 'profile_id'
    : 'user_id',

  this.editProfileId || userId
)
.maybeSingle();

      if (error) {
        throw error;
      }

if (!data) {

  if (this.isAdminCreated) {
    this.isLoadingProfile = false;
    return;
  }

  const loggedInUser = this.getStoredLoggedInUser();
  if (loggedInUser) {
          this.formData.fullName = loggedInUser.full_name || '';
          this.formData.email = loggedInUser.email || '';
          this.formData.mobile = loggedInUser.phone_number || '';
          this.formData.dob = loggedInUser.dob || '';
          if (this.formData.dob) {
            this.onDobChange();
          }
        }
        return;
      }
      this.isEditMode = true;
      this.formData.fullName = data.full_name || '';
      this.formDataTa.fullName = data.full_name_ta || '';
      this.formData.gender = data.gender_text || '';
      this.formData.dob = data.dob || '';
      this.formData.age = data.age ? String(data.age) : '';
      this.formData.maritalStatus = data.marital_status_text || '';
this.formData.maritalStatus =
  data.marital_status_text || '';

this.formData.secondMarriageReason =
  data.second_marriage_reason || '';
      this.formData.mobile = data.mobile || '';
      this.formData.additionalMobile =
  Array.isArray(data.additional_mobile)
    ? data.additional_mobile
    : [''];
      this.formData.email = data.email || '';
      this.formData.height = data.height_text || (data.height_cm ? String(data.height_cm) : '');
      this.formData.weight = data.weight_text || (data.weight_kg ? String(data.weight_kg) : '');
     this.formData.colorId = data.color_id || '';
this.formData.color = data.color_text || '';
      this.formData.religion = data.religion_text || '';
      this.formData.caste = data.caste_text || '';
      this.formData.subCaste =
  data.sub_caste_text || '';

this.formDataTa.subCaste =
  data.sub_caste_text_ta || '';
this.formData.marriedBrothers =
  String(data.married_brothers ?? 0);

this.formData.unmarriedBrothers =
  String(data.unmarried_brothers ?? 0);

this.formData.marriedSisters =
  String(data.married_sisters ?? 0);

this.formData.unmarriedSisters =
  String(data.unmarried_sisters ?? 0);

this.formData.handicapStatus =
  data.handicap_status ? 'Yes' : 'No';

this.formData.handicapDetails =
  data.handicap_details || '';

this.formDataTa.handicapDetails =
  data.handicap_details_ta || '';

this.formData.childrenStatus =
  data.children_status ? 'Yes' : 'No';

this.formData.childrenDetails =
  data.children_details || '';
this.formDataTa.childrenDetails =
  data.children_details || '';
this.formData.kalappuThirumanam =
  data.kalappu_thirumanam ? 'Yes' : 'No';

this.formData.kalappuThirumanamDetails =
  data.kalappu_thirumanam_details || '';

this.formDataTa.kalappuThirumanamDetails =
  data.kalappu_thirumanam_details_ta || '';

      this.formData.fatherName = data.father_name || '';

this.formData.thisai =
  data.thisai || '';

this.formData.thisaiIruppu =
  data.thisai_iruppu || '';

const thisaiMatch = String(
  data.thisai || ''
).match(/(\d+)\s*Year\s*(\d+)\s*Month\s*(\d+)\s*Day/i);

this.formData.thisaiYear = thisaiMatch?.[1] || '';
this.formData.thisaiMonth = thisaiMatch?.[2] || '';
this.formData.thisaiDay = thisaiMatch?.[3] || '';

this.formData.paatham =
  data.paatham || '';

this.formData.sothukal =
  data.sothukal || '';

this.formData.poorvegam =
  data.poorvegam || '';

this.formData.iruppidam =
  data.iruppidam || '';

this.poorvegamSearch =
  data.poorvegam || '';

this.iruppidamSearch =
  data.iruppidam || '';

this.formData.kuladeivam =
  data.kuladeivam || '';

  this.formData.kudumbaNilaiId =
  data.kudumba_nilai_id || '';

this.formData.kudumbaNilai =
  data.kudumba_nilai || '';
      this.formData.motherName = data.mother_name || '';
      this.formData.fatherOccupation = data.father_occupation_text || data.father_occupation || '';
      this.formData.motherOccupation = data.mother_occupation_text || data.mother_occupation || '';
      this.formData.siblings = data.siblings_text || '';
      this.formData.education = data.education_text || '';
      this.formData.job = data.occupation_text || '';
      this.formData.company = data.company_name || '';
      this.formData.workPlace = data.work_place || '';
      this.formData.salary = data.salary_text || (data.salary_amount ? String(data.salary_amount) : '');
      this.formData.address = data.address_line || '';
      this.formData.city = data.city_text || '';
      this.formData.state = data.state_text || '';
      this.formData.country = data.country_text || '';
      const religion = this.religionList.find(
  (r: any) => r.religion_name === data.religion_text || r.religion_name_ta === data.religion_text
);

this.selectedReligionId = religion?.religion_id || '';
this.casteList = this.allCastes.filter(
  (c: any) => c.religion_id === this.selectedReligionId
);

const country = this.countryList.find(
  (c: any) => c.country_name === data.country_text || c.country_name_ta === data.country_text
);

this.selectedCountryId = country?.country_id || '';
this.stateList = this.allStates.filter(
  (s: any) => s.country_id === this.selectedCountryId
);

const state = this.allStates.find(
  (s: any) => s.state_name === data.state_text || s.state_name_ta === data.state_text
);

this.selectedStateId = state?.state_id || '';
this.cityList = this.allCities.filter(
  (c: any) => c.state_id === this.selectedStateId
);

const city = this.allCities.find(
  (c: any) => c.city_name === data.city_text || c.city_name_ta === data.city_text
);

this.selectedCityId = city?.city_id || '';
      this.formData.rasi = data.rasi_text || '';
      this.formData.nakshatra = data.nakshatra_text || '';
      this.formData.lagnam = data.lagnam_text || '';
this.formData.gothram = data.gothram || '';
this.formDataTa.gothram = data.gothram_ta || '';
          this.formData.dhosham = data.dhosham_text || '';
      this.formData.birthTime = data.birth_time || '';
      this.formData.birthPlace = data.birth_place || '';
      this.formData.thisai =
  data.thisai || '';

this.formDataTa.thisai =
  data.thisai_ta || '';

this.formData.thisaiIruppu =
  data.thisai_iruppu || '';

this.formDataTa.thisaiIruppu =
  data.thisai_iruppu_ta || '';

this.formData.paatham =
  data.paatham || '';

this.formDataTa.paatham =
  data.paatham_ta || '';

this.formData.sothukal =
  data.sothukal || '';

this.formDataTa.sothukal =
  data.sothukal_ta || '';

this.formData.kuladeivam =
  data.kuladeivam || '';

this.formDataTa.kuladeivam =
  data.kuladeivam_ta || '';
      this.formDataTa.fatherName = data.father_name_ta || '';
      this.formDataTa.handicapDetails =
  data.handicap_details_ta || '';

this.formDataTa.thisai =
  data.thisai_ta || '';

this.formDataTa.thisaiIruppu =
  data.thisai_iruppu_ta || '';

this.formDataTa.paatham =
  data.paatham_ta || '';

this.formDataTa.sothukal =
  data.sothukal_ta || '';

this.formDataTa.poorvegam =
  data.poorvegam_ta || '';

this.formDataTa.iruppidam =
  data.iruppidam_ta || '';

this.formDataTa.kuladeivam =
  data.kuladeivam_ta || '';
this.formDataTa.motherName = data.mother_name_ta || '';
this.formDataTa.fatherOccupation = data.father_occupation_ta || '';
this.formDataTa.motherOccupation = data.mother_occupation_ta || '';
this.formDataTa.siblings = data.siblings_ta || '';
this.formDataTa.job = data.occupation_text_ta || '';
this.formDataTa.company = data.company_name_ta || '';
this.formDataTa.workPlace = data.work_place_ta || '';
this.formDataTa.aboutMe = data.about_me_ta || '';
this.formDataTa.partnerExpectation = data.partner_expectation_ta || '';
this.formDataTa.address = data.address_line_ta || '';
this.formDataTa.birthPlace = data.birth_place_ta || '';
      this.formData.aboutMe = data.about_me || '';
this.formData.partnerExpectation = data.partner_expectation || '';

this.formDataTa.aboutMe = data.about_me_ta || '';
this.formDataTa.partnerExpectation = data.partner_expectation_ta || '';

      this.existingLatitude =
        typeof data.latitude === 'number' ? data.latitude : this.safeNumber(data.latitude);
      this.existingLongitude =
        typeof data.longitude === 'number' ? data.longitude : this.safeNumber(data.longitude);

      this.rasiChart = Array.isArray(data.rasi_chart) ? data.rasi_chart.map((v: any) => String(v ?? '')) : Array(12).fill('');
      this.amsamChart = Array.isArray(data.amsam_chart) ? data.amsam_chart.map((v: any) => String(v ?? '')) : Array(12).fill('');

      this.existingProfileImageUrl = data.profile_image_url || null;
      this.existingVideoUrl = data.video_url || null;
      this.existingHoroscopeFileUrl = data.horoscope_file_url || null;

      this.profilePreviewUrl = this.existingProfileImageUrl;
      this.videoPreviewUrl = this.existingVideoUrl;

      if (
        this.existingHoroscopeFileUrl &&
        this.existingHoroscopeFileUrl.match(/\.(jpg|jpeg|png|webp)$/i)
      ) {
        this.horoscopePreviewUrl = this.existingHoroscopeFileUrl;
      } else {
        this.horoscopePreviewUrl = null;
      }

      if (this.formData.dob && !this.formData.age) {
        this.onDobChange();
      }
    } catch (error: any) {
     
      this.snackbar.error(error?.message || this.tr.alerts.profileLoadFailed);
    } finally {
      this.isLoadingProfile = false;
      this.cdr.detectChanges();
    }
  }

  onDobChange(): void {
    if (!this.formData.dob) {
      this.formData.age = '';
      return;
    }

    const birthDate = new Date(this.formData.dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.formData.age = age > 0 ? age.toString() : '';
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedProfileImage = null;
      this.profilePreviewUrl = this.existingProfileImageUrl;
      return;
    }

    const file = input.files[0];
    this.selectedProfileImage = file;
    this.profilePreviewUrl = URL.createObjectURL(file);
  }

  removeProfileImage(): void {
    this.selectedProfileImage = null;
    this.profilePreviewUrl = null;
    this.existingProfileImageUrl = null;
  }

  onAdditionalImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);

    files.forEach((file) => {
      this.additionalImages.push(file);
      this.additionalImagePreviews.push(URL.createObjectURL(file));
    });

    input.value = '';
  }

  removeAdditionalImage(index: number): void {
    this.additionalImages.splice(index, 1);
    this.additionalImagePreviews.splice(index, 1);
  }

  clearAdditionalImages(): void {
    this.additionalImages = [];
    this.additionalImagePreviews = [];
  }

  onVideoChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedVideo = null;
      this.videoPreviewUrl = this.existingVideoUrl;
      return;
    }

    const file = input.files[0];
    this.selectedVideo = file;
    this.videoPreviewUrl = URL.createObjectURL(file);
  }

  removeVideo(): void {
    this.selectedVideo = null;
    this.videoPreviewUrl = null;
    this.existingVideoUrl = null;
  }

  onHoroscopeFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedHoroscopeFile = null;
      this.horoscopePreviewUrl =
        this.existingHoroscopeFileUrl &&
        this.existingHoroscopeFileUrl.match(/\.(jpg|jpeg|png|webp)$/i)
          ? this.existingHoroscopeFileUrl
          : null;
      return;
    }

    const file = input.files[0];
    this.selectedHoroscopeFile = file;

    if (file.type.startsWith('image/')) {
      this.horoscopePreviewUrl = URL.createObjectURL(file);
    } else {
      this.horoscopePreviewUrl = null;
    }
  }

async extractHoroscopeData(): Promise<void> {

  if (!this.selectedHoroscopeFile) {

    this.snackbar.error(this.tr.alerts.uploadHoroscopeFirst);

    return;

  }

  this.isExtracting = true;

  try {

    const formData = new FormData();

    formData.append(
      'file',
      this.selectedHoroscopeFile
    );

    const { data, error } =
      await supabase.functions.invoke(
        'horoscope-autofill',
        {
          body: formData,
        }
      );


    if (error) {

    

      this.snackbar.error(this.tr.alerts.horoscopeFailed);

      return;

    }

    const extractedText =
      data?.ParsedResults?.[0]?.ParsedText || '';


    const text =
      extractedText.toLowerCase();

    // AUTO DETECT RASI
    for (const rasi of this.rasiDbList.map((x: any) => x.rasi_name)) {

      if (
        text.includes(rasi.toLowerCase())
      ) {

        this.formData.rasi = rasi;

        break;

      }

    }

    // AUTO DETECT NAKSHATRA
    for (const star of this.nakshatraDbList.map((x: any) => x.nakshatra_name)) {

      if (
        text.includes(star.toLowerCase())
      ) {

        this.formData.nakshatra = star;

        break;

      }

    }

    // AUTO DETECT LAGNAM
   for (const lag of this.lagnamDbList.map((x: any) => x.lagnam_name)) {

      if (
        text.includes(lag.toLowerCase())
      ) {

        this.formData.lagnam = lag;

        break;

      }

    }

    // GENDER
  // GENDER
if (text.includes('female')) {
  const female = this.genderList.find(
    (x: any) => x.gender_name?.toLowerCase() === 'female'
  );

  this.formData.gender = female?.gender_name || '';
} 
else if (text.includes('male')) {
  const male = this.genderList.find(
    (x: any) => x.gender_name?.toLowerCase() === 'male'
  );

  this.formData.gender = male?.gender_name || '';
}

   // DHOSHAM
if (
  text.includes('dhosham') ||
  text.includes('dosham')
) {
  const dhosham = this.dhoshamDbList.find(
    (x: any) => x.dhosham_name?.toLowerCase().includes('dhosham')
  );

  this.formData.dhosham = dhosham?.dhosham_name || '';
}

    // DEFAULT VALUES
    this.formData.birthPlace =
      this.formData.birthPlace || 'Madurai';

    this.formData.birthTime =
      this.formData.birthTime || '06:30';

    // SAMPLE CHART AUTO FILL
    this.rasiChart = [
      '1', '', '4', '',
      '7', '', '2', '',
      '5', '', '', '9'
    ];

    this.amsamChart = [
      '', '3', '', '6',
      '', '8', '', '1',
      '', '', '10', ''
    ];

    this.onDobChange();

    this.snackbar.success(this.tr.alerts.horoscopeFilled);

  } catch (error) {

   

    this.snackbar.error(this.tr.alerts.horoscopeFailed);

  } finally {

    this.isExtracting = false;

    this.cdr.detectChanges();

  }

}

  private getCompletionPercentage(): number {
    const completionFields = [
      this.formData.fullName,
      this.formData.gender,
      this.formData.dob,
      this.formData.mobile,
      this.formData.email,
      this.formData.religion,
      this.formData.caste,
      this.formData.education,
      this.formData.job,
      this.formData.city,
      this.formData.state,
      this.formData.country,
      this.formData.rasi,
      this.formData.nakshatra,
      this.formData.lagnam,
      this.formData.aboutMe,
      this.formData.partnerExpectation
    ];

    const filledCount = completionFields.filter(
      (value) => value && String(value).trim() !== ''
    ).length;

    return Math.round((filledCount / completionFields.length) * 100);
  }



private async uploadProfileImage(file: File): Promise<string | null> {

  const formData = new FormData();

  formData.append('file', file);

  formData.append('folder', 'profiles');

  const { data, error } =
    await supabase.functions.invoke(
      'upload-r2',
      {
        body: formData,
      }
    );

  if (error) {

    

    throw error;

  }

  return data?.url || null;

}
private async uploadVideo(file: File): Promise<string | null> {

  const formData = new FormData();

  formData.append('file', file);

  formData.append('folder', 'videos');

  const { data, error } =
    await supabase.functions.invoke(
      'upload-r2',
      {
        body: formData,
      }
    );

  if (error) {

 

    throw error;

  }

  return data?.url || null;

}

private async uploadHoroscope(file: File): Promise<string | null> {

  const formData = new FormData();

  formData.append('file', file);

  formData.append('folder', 'horoscopes');

  const { data, error } =
    await supabase.functions.invoke(
      'upload-r2',
      {
        body: formData,
      }
    );

  if (error) {



    throw error;

  }

  return data?.url || null;

}
private async uploadAdditionalImages(): Promise<string[]> {

  const uploadedUrls: string[] = [];

  for (const file of this.additionalImages) {

    const formData = new FormData();

    formData.append('file', file);

    formData.append('folder', 'additional-images');

    const { data, error } =
      await supabase.functions.invoke(
        'upload-r2',
        {
          body: formData,
        }
      );

    if (error) {

     

      continue;

    }

    if (data?.url) {

      uploadedUrls.push(data.url);

    }

  }

  return uploadedUrls;

}
private markRequiredErrors(): string | null {
  this.fieldErrors = {};

const v = (en: any, ta?: any) => {
  if (this.currentLang === 'ta') {
    return String(ta || '').trim();
  }

  return String(en || '').trim();
};

  const requiredFields: { key: string; label: string; value: any }[] = [
    { key: 'fullName', label: this.tr.labels.fullName, value: v(this.formData.fullName, this.formDataTa.fullName) },
    { key: 'gender', label: this.tr.labels.gender, value: this.formData.gender },
    { key: 'dob', label: this.tr.labels.dob, value: this.formData.dob },
    { key: 'maritalStatus', label: this.tr.labels.maritalStatus, value: this.formData.maritalStatus },
    { key: 'mobile', label: this.tr.labels.mobile, value: this.formData.mobile },
    // { key: 'email', label: this.tr.labels.email, value: this.formData.email },
    // { key: 'height', label: this.tr.labels.height, value: this.formData.height },
    // { key: 'weight', label: this.tr.labels.weight, value: this.formData.weight },
    { key: 'religion', label: this.tr.labels.religion, value: this.selectedReligionId },
    { key: 'caste', label: this.tr.labels.caste, value: this.formData.caste },
    // { key: 'fatherName', label: this.tr.labels.fatherName, value: v(this.formData.fatherName, this.formDataTa.fatherName) },
    // { key: 'motherName', label: this.tr.labels.motherName, value: v(this.formData.motherName, this.formDataTa.motherName) },
    // { key: 'fatherOccupation', label: this.tr.labels.fatherOccupation, value: v(this.formData.fatherOccupation, this.formDataTa.fatherOccupation) },
    // { key: 'siblings', label: this.tr.labels.siblings, value: v(this.formData.siblings, this.formDataTa.siblings) },
    { key: 'education', label: this.tr.labels.education, value: this.formData.education === 'Other' ? this.formData.otherEducation : this.formData.education },
    // { key: 'job', label: this.tr.labels.occupation, value: this.formData.job === 'Other' ? this.formData.otherProfession : this.formData.job },
    // { key: 'company', label: this.tr.labels.company, value: v(this.formData.company, this.formDataTa.company) },
    // { key: 'salary', label: this.tr.labels.salary, value: v(this.formData.salary, this.formDataTa.salary) },
    { key: 'address', label: this.tr.labels.address, value: v(this.formData.address, this.formDataTa.address) },
{
  key: 'country',
  label: this.tr.labels.country,
  value: this.isOtherCountrySelected()
    ? this.formData.country
    : this.selectedCountryId
},

{
  key: 'state',
  label: this.tr.labels.state,
  value:
    this.isOtherCountrySelected() || this.isOtherStateSelected()
      ? this.formData.state
      : this.selectedStateId
},

{
  key: 'city',
  label: this.tr.labels.city,
  value:
    this.isOtherCountrySelected() ||
    this.isOtherStateSelected() ||
    this.isOtherCitySelected()
      ? this.formData.city
      : this.selectedCityId
},
    // { key: 'horoscopeFile', label: this.tr.sections.horoscopeUpload, value: this.selectedHoroscopeFile || this.existingHoroscopeFileUrl },
    // { key: 'rasi', label: this.tr.labels.rasi, value: this.formData.rasi },
    // { key: 'nakshatra', label: this.tr.labels.nakshatra, value: this.formData.nakshatra },
    // { key: 'lagnam', label: this.tr.labels.lagnam, value: this.formData.lagnam },
    // { key: 'birthTime', label: this.tr.labels.birthTime, value: this.formData.birthTime },
    // { key: 'birthPlace', label: this.tr.labels.birthPlace, value: v(this.formData.birthPlace, this.formDataTa.birthPlace) }
  ];

  for (const field of requiredFields) {
    if (!String(field.value || '').trim()) {
      this.fieldErrors[field.key] = true;
      this.cdr.detectChanges();
      return field.label;
    }
  }

  this.cdr.detectChanges();
  return null;
}
async onSubmit(): Promise<void> {


  this.submitted = true;
  this.fieldErrors = {};

 const missingField = this.markRequiredErrors();

console.log(this.fieldErrors);
console.log(this.formData);
if (missingField) {
  this.isSaving = false;

  this.snackbar.error(
    this.currentLang === 'ta'
      ? `${missingField} நிரப்பவும்`
      : `Please fill ${missingField}`
  );

  return;
}
      const selectedCity = this.cityList.find(
    (x: any) => x.city_id === this.selectedCityId
  );

 if (selectedCity) {
  this.formData.city = selectedCity.city_name || '';
}
const selectedGender = this.genderList.find(
  (x: any) => x.gender_name === this.formData.gender
);

const selectedMaritalStatus = this.maritalStatusList.find(
  (x: any) => x.status_name === this.formData.maritalStatus
);

const selectedReligion = this.religionList.find(
  (x: any) => x.religion_id === this.selectedReligionId
);

const selectedCaste = this.casteList.find(
  (x: any) => x.caste_name === this.formData.caste
);

const selectedCountry = this.countryList.find(
  (x: any) => x.country_id === this.selectedCountryId
);

const selectedState = this.stateList.find(
  (x: any) => x.state_id === this.selectedStateId
);

const selectedEducation = this.educationList.find(
  (x: any) => x.education_name === this.formData.education
);

const selectedOccupation = this.professionList.find(
  (x: any) =>
    x.profession_name === this.formData.job ||
    x.occupation_name === this.formData.job
);

const selectedDhosham = this.dhoshamDbList.find(
  (x: any) => x.dhosham_name === this.formData.dhosham
);

const selectedRasi = this.rasiDbList.find(
  (x: any) => x.rasi_name === this.formData.rasi
);

const selectedNakshatra = this.nakshatraDbList.find(
  (x: any) => x.nakshatra_name === this.formData.nakshatra
);

const selectedLagnam = this.lagnamDbList.find(
  (x: any) => x.lagnam_name === this.formData.lagnam
);

const selectedColor = this.colorList.find(
  (x: any) => x.color_id === this.formData.colorId
);

const selectedKudumbaNilai = this.kudumbaNilaiList.find(
  (x: any) => x.kudumba_nilai_id === this.formData.kudumbaNilaiId
);
this.isSaving = true;



await this.prepareEnglishValues();
   try {

        if (this.currentLang === 'en') {
          await this.prepareAutoTamilValues();
        }
let appUserId = this.currentUserId || '';

/* ADMIN CREATE MODE */
if (this.isAdminCreated && !this.editProfileId) {

const adminEmail =
  this.safeText(this.formData.email) ||
  `${this.safeText(this.formData.mobile)}@astroalliance.com`;

const { data: alreadyUser } = await supabase
  .from('app_users')
  .select('user_id')
  .eq('email', adminEmail)
  .maybeSingle();

if (alreadyUser) {

 this.isSaving = false;
this.cdr.detectChanges();

setTimeout(() => {
  this.snackbar.error('This mobile/email already exists');
}, 0);

return;
}

const { data: newUser, error: newUserError } =
  await supabase
    .from('app_users')
    .insert({
      auth_user_id: crypto.randomUUID(),
      first_name: this.safeText(this.formData.fullName),
      last_name: '',
      email: adminEmail,
      phone_number: this.safeText(this.formData.mobile),
      date_of_birth: this.formData.dob || null,
      is_active: true
    })
    .select('user_id')
    .single();
console.log(
  'APP USERS INSERT ERROR:',
  JSON.stringify(newUserError, null, 2)
);
console.log('APP USERS DATA:', newUser);
  if (newUserError) {

    this.isSaving = false;

    this.cdr.detectChanges();

setTimeout(() => {
  this.snackbar.error(newUserError.message);
}, 0);

    return;

  }

  appUserId = newUser.user_id;

}
/* NORMAL USER MODE */
else if (!appUserId) {

  appUserId =
    await this.resolveCurrentUserId() || '';

}
      let fallbackEmail = '';
      let fallbackPhone = '';

      const loggedInUser = this.getStoredLoggedInUser();
      if (loggedInUser) {
        fallbackEmail = loggedInUser.email || '';
        fallbackPhone = loggedInUser.phone_number || '';
      }

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

    if (!this.isAdminCreated && !userError && user) {
        const { data: appUser, error: appUserError } = await supabase
          .from('app_users')
          .select('user_id, auth_user_id, email, phone_number')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (!appUserError && appUser) {
          if (!this.isAdminCreated) {
  appUserId = appUser.user_id;
}
          fallbackEmail = appUser.email || user.email || fallbackEmail;
          fallbackPhone = appUser.phone_number || fallbackPhone;
        }
      }
if (!this.isAdminCreated && !appUserId && this.isBrowser) {
  const storedAppUserId = localStorage.getItem('app_user_id');
  const storedEmail = localStorage.getItem('app_user_email') || '';
  const storedPhone = localStorage.getItem('app_user_phone') || '';

        if (storedAppUserId) {
          appUserId = storedAppUserId;
        }

        fallbackEmail = fallbackEmail || storedEmail;
        fallbackPhone = fallbackPhone || storedPhone;
      }
console.log('APP USER ID:', appUserId);
console.log('IS ADMIN CREATED:', this.isAdminCreated);
      if (!appUserId && !this.editProfileId) {
  this.isSaving = false;
  this.cdr.detectChanges();
  this.snackbar.error(this.tr.alerts.loginRequired);
  return;
}
console.log('FINAL USER ID:', appUserId);
console.log('EDIT MODE:', this.isEditMode);
console.log('ADMIN CREATED:', this.isAdminCreated);

      this.currentUserId = appUserId;

      const { data: currentProfile, error: currentProfileError } = await supabase
        .from('user_profiles')
      .select('profile_code, profile_image_url, video_url, horoscope_file_url, additional_image_urls, latitude, longitude')
       .eq(
  this.editProfileId
    ? 'profile_id'
    : 'user_id',

  this.editProfileId || appUserId
)
        .maybeSingle();

      if (currentProfileError) {
        throw currentProfileError;
      }

      let existingProfileCode: string | null = null;

      if (currentProfile?.profile_code && String(currentProfile.profile_code).trim() !== '') {
        existingProfileCode = String(currentProfile.profile_code).trim();
      }

      const resolvedProfileCode = existingProfileCode;

      let profileImageUrl =
        currentProfile?.profile_image_url || this.existingProfileImageUrl || null;
      let videoUrl = currentProfile?.video_url || this.existingVideoUrl || null;
      let horoscopeFileUrl =
        currentProfile?.horoscope_file_url || this.existingHoroscopeFileUrl || null;
        let additionalImageUrls: string[] = [];

      if (this.selectedProfileImage) {
        profileImageUrl = await this.uploadProfileImage(this.selectedProfileImage);
      }

      if (this.selectedVideo) {
        videoUrl = await this.uploadVideo(this.selectedVideo);
      }

      if (this.selectedHoroscopeFile) {
        horoscopeFileUrl = await this.uploadHoroscope(this.selectedHoroscopeFile);
      }
if (this.additionalImages.length > 0) {

  additionalImageUrls =
    await this.uploadAdditionalImages();

}
      const locationCoords = await this.getLatLngFromLocation();

      const resolvedLatitude =
        locationCoords.lat !== null
          ? locationCoords.lat
          : (typeof currentProfile?.latitude === 'number' ? currentProfile.latitude : this.existingLatitude);

      const resolvedLongitude =
        locationCoords.lng !== null
          ? locationCoords.lng
          : (typeof currentProfile?.longitude === 'number' ? currentProfile.longitude : this.existingLongitude);


const taSnapshot = { ...this.formDataTa };
console.log('SAVE CHECK:', {
  en: this.formData,
  ta: taSnapshot
});
const selectedEducation = this.educationList.find(
  (x: any) => x.education_name === this.formData.education
);

const selectedOccupation = this.professionList.find(
  (x: any) =>
    x.profession_name === this.formData.job ||
    x.occupation_name === this.formData.job
);

const selectedDhosham = this.dhoshamDbList.find(
  (x: any) => x.dhosham_name === this.formData.dhosham
);
console.log('PAYLOAD USER ID:', appUserId);

      const payload = {
        user_id: appUserId,
       

        full_name: this.safeText(this.formData.fullName),

       gender_id: selectedGender?.gender_id || null,

        gender_text: this.safeText(this.formData.gender),

        dob: this.formData.dob || null,
        age: this.safeNumber(this.formData.age),

     marital_status_id: selectedMaritalStatus?.marital_status_id || null,

        marital_status_text: this.safeText(this.formData.maritalStatus),

second_marriage_reason:
  this.formData.secondMarriageReason || null,

second_marriage_reason_ta:
  this.formData.secondMarriageReason === 'Divorced'
    ? 'விவாகரத்து'
    : this.formData.secondMarriageReason === 'Widowed'
      ? 'துணையை இழந்தவர்'
      : null,


        mobile: this.safeText(this.formData.mobile || fallbackPhone),
        additional_mobile:
  this.formData.additionalMobile
    .filter((x: string) => x.trim() !== ''),
        email: this.safeText(this.formData.email || fallbackEmail),

        height_cm: this.safeNumber(this.formData.height),
        height_text: this.safeText(this.formData.height),

        weight_kg: this.safeNumber(this.formData.weight),
        weight_text: this.safeText(this.formData.weight),

       religion_id: this.selectedReligionId || null,

     religion_text: this.safeText(
  this.religionList.find(
    (r: any) => r.religion_id === this.selectedReligionId
  )?.religion_name || this.formData.religion
),

caste_id: selectedCaste?.caste_id || null,

caste_text: this.safeText(this.formData.caste),
sub_caste_text: this.safeText(this.formData.subCaste),
sub_caste_text_ta: this.safeText(this.formDataTa.subCaste),

married_brothers:
  this.safeNumber(this.formData.marriedBrothers) || 0,

unmarried_brothers:
  this.safeNumber(this.formData.unmarriedBrothers) || 0,

married_sisters:
  this.safeNumber(this.formData.marriedSisters) || 0,

unmarried_sisters:
  this.safeNumber(this.formData.unmarriedSisters) || 0,

color_id: this.formData.colorId || null,
color_text: selectedColor?.color_name || '',

kudumba_nilai_id: this.formData.kudumbaNilaiId || null,
kudumba_nilai: selectedKudumbaNilai?.nilai_name || '',

handicap_status:
  this.formData.handicapStatus === 'Yes',

handicap_details:
  this.safeText(this.formData.handicapDetails),

handicap_details_ta:
  this.safeText(this.formDataTa.handicapDetails),

children_status:
  this.formData.childrenStatus === 'Yes',

children_details: this.formData.childrenDetails || null,

kalappu_thirumanam:
  this.formData.kalappuThirumanam === 'Yes',

kalappu_thirumanam_details:
  this.safeText(this.formData.kalappuThirumanamDetails),

kalappu_thirumanam_details_ta:
  this.safeText(this.formDataTa.kalappuThirumanamDetails),

father_name: this.safeText(this.formData.fatherName),

mother_name: this.safeText(this.formData.motherName),

full_name_ta: this.safeText(taSnapshot.fullName),

father_name_ta: this.safeText(taSnapshot.fatherName),

mother_name_ta: this.safeText(taSnapshot.motherName),

father_occupation_ta: this.safeText(taSnapshot.fatherOccupation),

mother_occupation_ta: this.safeText(taSnapshot.motherOccupation),

siblings_ta: this.safeText(taSnapshot.siblings),

occupation_text_ta: this.safeText(
  this.formData.job === 'Other'
    ? taSnapshot.job
    : (
        this.professionList.find(
          (p: any) => p.profession_name === this.formData.job
        )?.profession_name_ta || taSnapshot.job
      )
),
company_name_ta: this.safeText(taSnapshot.company),

address_line_ta: this.safeText(taSnapshot.address),

birth_place_ta: this.safeText(taSnapshot.birthPlace),

gothram_ta: this.safeText(this.formDataTa.gothram),

about_me_ta: this.safeText(taSnapshot.aboutMe),

partner_expectation_ta: this.safeText(taSnapshot.partnerExpectation),

father_occupation_text: this.safeText(this.formData.fatherOccupation),

father_occupation: this.safeText(this.formData.fatherOccupation),

mother_occupation_text: this.safeText(this.formData.motherOccupation),

mother_occupation: this.safeText(this.formData.motherOccupation),

siblings_text: this.safeText(this.formData.siblings),
education_id: selectedEducation?.education_id || null,


education_text: this.safeText(
  this.formData.education === 'Other'
    ? this.formData.otherEducation
    : this.formData.education
),
education_text_ta: this.safeText(
  this.formData.education === 'Other'
    ? await this.translateText(this.formData.otherEducation, 'ta')
    : this.getTamilEducationName(this.formData.education)
),
occupation_id: selectedOccupation?.profession_id || null,


occupation_text: this.safeText(
  this.formData.job === 'Other'
    ? this.formData.otherProfession
    : this.formData.job
),
company_name: this.safeText(this.formData.company),
work_place: this.safeText(this.formData.workPlace),
work_place_ta: this.safeText(this.formDataTa.workPlace),
        salary_amount: this.safeNumber(this.formData.salary),
        salary_currency: 'INR',
        salary_text: this.safeText(this.formData.salary),

address_line: this.safeText(this.formData.address),
      location_text: this.safeText(
          [
            this.formData.address,
            this.formData.city,
            this.formData.state,
            this.formData.country
          ]
            .filter((v) => v && String(v).trim() !== '')
            .join(', ')
        ),

        city_id: this.selectedCityId || null,

      city_text: this.safeText(
  this.cityList.find(
    (c: any) => c.city_id === this.selectedCityId
  )?.city_name || this.formData.city
),

state_id: this.selectedStateId || null,

state_text: this.safeText(
  this.stateList.find(
    (s: any) => s.state_id === this.selectedStateId
  )?.state_name || this.formData.state
),

country_id: this.selectedCountryId || null,
country_text: this.safeText(
  this.countryList.find(
    (c: any) => c.country_id === this.selectedCountryId
  )?.country_name || this.formData.country
),
        latitude: resolvedLatitude,
        longitude: resolvedLongitude,

      rasi_id: selectedRasi?.rasi_id || null,
rasi_text: this.safeText(selectedRasi?.rasi_name || this.formData.rasi),
rasi_text_ta: this.safeText(selectedRasi?.rasi_name_ta || ''),

nakshatra_id: selectedNakshatra?.nakshatra_id || null,
nakshatra_text: this.safeText(selectedNakshatra?.nakshatra_name || this.formData.nakshatra),
nakshatra_text_ta: this.safeText(selectedNakshatra?.nakshatra_name_ta || ''),

lagnam_id: selectedLagnam?.lagnam_id || null,
lagnam_text: this.safeText(selectedLagnam?.lagnam_name || this.formData.lagnam),
lagnam_text_ta: this.safeText(selectedLagnam?.lagnam_name_ta || ''),

gothram: this.safeText(
  this.currentLang === 'ta'
    ? (
        await this.translateText(
          this.formDataTa.gothram,
          'en'
        )
      ) || this.formData.gothram
    : this.formData.gothram
),
    dhosham_id: selectedDhosham?.dhosham_id || null,
      dhosham_text: this.safeText(selectedDhosham?.dhosham_name || this.formData.dhosham),
dhosham_text_ta: this.safeText(selectedDhosham?.dhosham_name_ta || ''),

        birth_time: this.formData.birthTime || null,
birth_place: this.safeText(this.formData.birthPlace),


thisai: this.safeText(
  `${this.formData.thisaiYear || ''} Y ${this.formData.thisaiMonth || ''} M ${this.formData.thisaiDay || ''} D`
),

thisai_ta: this.safeText(
  `${this.formData.thisaiYear || ''} வ ${this.formData.thisaiMonth || ''} மா ${this.formData.thisaiDay || ''} நா`
),

thisai_iruppu: this.safeText(this.formData.thisaiIruppu),

thisai_iruppu_ta: this.safeText(
  this.thisaiIruppuList.find(
    (x: any) => x.thisai_iruppu_name === this.formData.thisaiIruppu
  )?.thisai_iruppu_name_ta || this.formData.thisaiIruppu
),

paatham: this.safeText(this.formData.paatham),
paatham_ta: this.safeText(this.formDataTa.paatham),

sothukal: this.safeText(this.formData.sothukal),
sothukal_ta: this.safeText(this.formDataTa.sothukal),

kuladeivam: this.safeText(this.formData.kuladeivam),
kuladeivam_ta: this.safeText(this.formDataTa.kuladeivam),

poorvegam: this.safeText(this.formData.poorvegam),

poorvegam_ta: this.safeText(
  this.formDataTa.poorvegam
),

iruppidam: this.safeText(
  this.formData.iruppidam
),

iruppidam_ta: this.safeText(
  this.formDataTa.iruppidam
),

about_me: this.safeText(this.formData.aboutMe),

partner_expectation: this.safeText(this.formData.partnerExpectation),

        rasi_chart: this.rasiChart,
        amsam_chart: this.amsamChart,

        profile_image_url: profileImageUrl || '',
        horoscope_file_url: horoscopeFileUrl || '',
        video_url: videoUrl || '',
additional_image_urls: additionalImageUrls,
        completion_percentage: this.getCompletionPercentage(),
      profile_status: this.isAdminCreated ? 'Approved' : 'Pending',
        is_verified: false,
        is_published: true,
        updated_at: new Date().toISOString()
      };
      if (existingProfileCode) {
  (payload as any).profile_code = existingProfileCode;
}
if (this.editProfileId) {

  delete (payload as any).user_id;

  const { data, error } = await supabase
    .from('user_profiles')
    .update(payload)
    .eq('profile_id', this.editProfileId)
    .select();

  console.log('ADMIN PROFILE UPDATE DATA:', data);
  console.log('ADMIN PROFILE UPDATE ERROR:', error);

  if (error) {
    this.snackbar.error(error.message);
    return;
  }

  this.snackbar.success(
    this.currentLang === 'ta'
      ? 'பயோடேட்டா வெற்றிகரமாக புதுப்பிக்கப்பட்டது'
      : 'Biodata Updated Successfully'
  );

  setTimeout(() => {
    window.location.href = '/admin/profiles';
  }, 1000);

  return;
}
const { data: existingProfile, error: existingError } = await supabase
  .from('user_profiles')
  .select('profile_id, user_id')
  .eq(
    this.editProfileId ? 'profile_id' : 'user_id',
    this.editProfileId || appUserId
  )
  .maybeSingle();

      if (existingError) {
        this.snackbar.error(existingError.message);
        return;
      }

if (existingProfile) {

  const { data, error } = await supabase
    .from('user_profiles')
    .update(payload)
    .eq('profile_id', existingProfile.profile_id)
    .select();

  console.log('USER PROFILE UPDATE DATA:', data);
  console.log('USER PROFILE UPDATE ERROR:', error);

  if (error) {
    console.log('ERROR MESSAGE:', error.message);
    console.log('ERROR DETAILS:', error.details);
    console.log('ERROR HINT:', error.hint);

    this.snackbar.error(error.message);
    return;
  }

} else {

 const { data, error } = await supabase
  .from('user_profiles')
  .insert([payload])
  .select();

console.log('USER PROFILE INSERT DATA:', data);
console.log('USER PROFILE INSERT ERROR:', error);

  if (error) {
    this.snackbar.error(error.message);
    return;
  }

}
const successMessage = this.isEditMode
  ? (
      this.currentLang === 'ta'
        ? 'பயோடேட்டா வெற்றிகரமாக புதுப்பிக்கப்பட்டது'
        : 'Biodata Updated Successfully'
    )
  : (
      this.currentLang === 'ta'
        ? 'பயோடேட்டா வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது'
        : 'Biodata Submitted Successfully'
    );

this.isSaving = false;
this.cdr.detectChanges();

setTimeout(() => {
  this.snackbar.success(successMessage);
}, 0);
if (this.isAdminCreated) {
  localStorage.removeItem('admin_created_user_id');

  setTimeout(() => {
    this.router.navigate(['/admin/profiles']);
  }, 1200);

  return;
}

this.isSubmitted = true;

setTimeout(async () => {
  await this.loadExistingBiodata();
}, 1200);

    } catch (error: any) {
      
      this.snackbar.error(error?.message || 'Something went wrong while saving biodata');
    } finally {
  this.isSaving = false;
  this.cdr.detectChanges();
}
  }
async loadCastes() {

  const { data, error } = await supabase
    .from('mst_castes')
    .select('*')
    .eq('is_active', true)
    .order('caste_name');

  if (error) {
    return;
  }

  this.allCastes = data || [];
}
async loadColors() {
  const { data, error } = await supabase
    .from('mst_colors')
    .select('*');

  console.log('COLORS', data);
  console.log('COLORS ERROR', error);

  this.colorList = data || [];
}
async loadKudumbaNilai() {
  const { data, error } = await supabase
    .from('mst_kudumba_nilai')
    .select('*');

  console.log('KUDUMBA', data);
  console.log('KUDUMBA ERROR', error);

  this.kudumbaNilaiList = data || [];
}
async loadReligions() {

  const { data, error } = await supabase
    .from('mst_religions')
 .select('*')
.eq('is_active', true)
.order('sort_order', { ascending: true });

  if (error) {


    return;

  }

  this.religionList = data || [];

}
async loadMaritalStatuses(): Promise<void> {
  const { data, error } = await supabase
    .from('mst_marital_statuses')
    .select('marital_status_id, status_code, status_name, status_name_ta, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    this.maritalStatusList = [];
    return;
  }

  this.maritalStatusList = data || [];
}
async loadGenders(): Promise<void> {
  const { data, error } = await supabase
    .from('mst_genders')
    .select('gender_id, gender_code, gender_name, gender_name_ta, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  this.genderList = error ? [] : (data || []);
}
async loadThisaiIruppu(): Promise<void> {

  const { data, error } = await supabase
    .from('mst_thisai_iruppu')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {

    

    return;

  }



  this.thisaiIruppuList = data || [];
this.cdr.detectChanges();
}
onReligionChange() {

  const selectedReligion = this.religionList.find(
    (r: any) => r.religion_id === this.selectedReligionId
  );

  this.formData.religion =
    selectedReligion?.religion_name || '';

  this.formData.caste = '';

  this.casteList = this.allCastes.filter(
    (c: any) =>
      c.religion_id === this.selectedReligionId
  );

}
async loadCountries() {

  const { data, error } = await supabase
    .from('mst_countries')
    .select('*');



  if (error) {
    
    return;
  }

  this.countryList = data || [];
  this.cdr.detectChanges();

}

async loadStates() {

  const { data, error } = await supabase
    .from('mst_states')
    .select('*')
    .order('state_name');

  if (error) {


    return;

  }

  this.allStates = data || [];

}

async loadCities() {

  const { data, error } = await supabase
    .from('mst_cities')
    .select('*')
    .order('city_name');

  if (error) {



    return;

  }

  this.allCities = data || [];

}

onCountryChange(): void {
  const country = this.countryList.find(
    (c: any) => c.country_id === this.selectedCountryId
  );

  this.formData.country = country?.country_name || '';
  this.formData.state = '';
  this.formData.city = '';

  this.selectedStateId = '';
  this.selectedCityId = '';

  if (this.isOtherCountrySelected()) {
    this.stateList = [];
    this.cityList = [];
    return;
  }

  this.stateList = this.allStates.filter(
    (s: any) => s.country_id === this.selectedCountryId
  );

  this.cityList = [];
}

onStateChange(): void {
  const state = this.stateList.find(
    (s: any) => s.state_id === this.selectedStateId
  );

  this.formData.state = state?.state_name || '';
  this.formData.city = '';

  this.selectedCityId = '';

  if (this.isOtherStateSelected()) {
    this.cityList = [];
    return;
  }

  this.cityList = this.allCities.filter(
    (c: any) => c.state_id === this.selectedStateId
  );
}
async loadProfessionList() {
  const { data, error } = await supabase
    .from('mst_professions')
   .select('profession_id, profession_name, profession_name_ta, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
 
    this.professionList = [];
    return;
  }


  this.professionList = data || [];
  this.cdr.detectChanges();
}
async loadDhoshamList(): Promise<void> {
  const { data, error } = await supabase
    .from('mst_dhosham')
    .select('dhosham_id, dhosham_name, dhosham_name_ta, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Dhosham load error:', error);
    this.dhoshamDbList = [];
    return;
  }

  this.dhoshamDbList = data || [];
}
async loadEducationLevels() {

  const { data, error } = await supabase
    .from('mst_education_levels')
    .select('*')
    .eq('is_active', true)
    .order('education_name');

  if (error) {

  

    return;

  }

  this.educationList = data || [];

  this.filteredEducationList = [...this.educationList];

}

onEducationSearchChange() {

  const term =
    this.educationSearch
      .toLowerCase()
      .trim();

  this.filteredEducationList =
    this.educationList.filter(
      (edu: any) =>
        String(edu.education_name || '')
          .toLowerCase()
          .includes(term)
    );

}
onEducationSelected() {
  this.formData.education = this.educationSearch.trim();
}

canShowAddEducationButton(): boolean {
  const name = this.educationSearch.trim().toLowerCase();

  if (!name) return false;

  return !this.educationList.some((edu: any) =>
    String(edu.education_name || '').trim().toLowerCase() === name
  );
}

async addEducationLevel() {
  const name = this.educationSearch.trim();

  if (!name) return;

  const normalName = name.toLowerCase();

  const localDuplicate = this.educationList.find((edu: any) =>
    String(edu.education_name || '').trim().toLowerCase() === normalName
  );

  if (localDuplicate) {
    this.educationSearch = localDuplicate.education_name;
    this.formData.education = localDuplicate.education_name;
    this.filteredEducationList = [];
    return;
  }

  const { data: existingDb, error: checkError } = await supabase
    .from('mst_education_levels')
    .select('*')
    .ilike('education_name', name)
    .maybeSingle();

  if (checkError) {
    this.snackbar.error(checkError.message);
    return;
  }

  if (existingDb) {
    this.educationSearch = existingDb.education_name;
    this.formData.education = existingDb.education_name;

    if (!this.educationList.some((edu: any) => edu.education_id === existingDb.education_id)) {
      this.educationList.push(existingDb);
    }

    this.filteredEducationList = [];
    return;
  }

  const { data, error } = await supabase
    .from('mst_education_levels')
    .insert({
      education_name: name,
      education_code: name.toUpperCase().replace(/\s+/g, '_'),
      is_active: true
    })
    .select()
    .single();

  if (error) {
    this.snackbar.error(error.message);
    return;
  }

  this.educationList.push(data);
  this.educationSearch = data.education_name;
  this.formData.education = data.education_name;
  this.filteredEducationList = [];
}
selectEducation(name: string) {
  this.educationSearch = name;
  this.formData.education = name;

  if (this.currentLang === 'ta') {
    const edu = this.educationList.find(
      (e: any) => e.education_name === name || e.education_name_ta === name
    );

    this.formData.education = edu?.education_name || name;
  }

  this.showEducationDropdown = false;
  this.filteredEducationList = [];
}
toggleEducationDropdown() {

  this.showEducationDropdown =
    !this.showEducationDropdown;

  if (this.showEducationDropdown) {

    this.educationSearch = '';

    this.filteredEducationList =
      [...this.educationList];

  }

}
trackByIndex(index: number): number {
  return index;
}

onPoorvegamSearchChange(): void {
  const term = this.poorvegamSearch.toLowerCase().trim();

  this.filteredPoorvegamList = this.allCities.filter((city: any) =>
    String(city.city_name || '').toLowerCase().includes(term) ||
    String(city.city_name_ta || '').toLowerCase().includes(term)
  );

  this.filteredPoorvegamList.push({
    city_name: 'Other',
    city_name_ta: 'மற்றவை'
  });
}

selectPoorvegam(city: any): void {
  this.poorvegamSearch =
    this.currentLang === 'ta'
      ? (city.city_name_ta || city.city_name)
      : city.city_name;

  this.formData.poorvegam = city.city_name;
  this.formDataTa.poorvegam = city.city_name_ta || city.city_name;

  this.showPoorvegamDropdown = false;
}

onIruppidamSearchChange(): void {
  const term = this.iruppidamSearch.toLowerCase().trim();

  this.filteredIruppidamList = this.allCities.filter((city: any) =>
    String(city.city_name || '').toLowerCase().includes(term) ||
    String(city.city_name_ta || '').toLowerCase().includes(term)
  );

  this.filteredIruppidamList.push({
    city_name: 'Other',
    city_name_ta: 'மற்றவை'
  });
}

selectIruppidam(city: any): void {
  this.iruppidamSearch =
    this.currentLang === 'ta'
      ? (city.city_name_ta || city.city_name)
      : city.city_name;

  this.formData.iruppidam = city.city_name;
  this.formDataTa.iruppidam = city.city_name_ta || city.city_name;

  this.showIruppidamDropdown = false;
}
}

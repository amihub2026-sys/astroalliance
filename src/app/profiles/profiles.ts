import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  HostListener,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { App } from '../app';
import { supabase } from '../core/supabase.client';
import { SnackbarService } from '../shared/snackbar.service';

type TabType = 'browse' | 'liked' | 'likedMe';

interface LangText {
  en: string;
  ta: string;
}

interface ProfileItem {
  profileId: string;
  id: string;
  userId: string;
  dob?: string | null;
  name: LangText;
  age: number;
  religion: LangText;
  location: LangText;
  city: LangText;
  state: LangText;
  profession: LangText;
  education: LangText;
  maritalStatus: LangText;
  caste: LangText;
  gender: LangText;
  nakshatra: LangText;
  image: string;
  liked: boolean;
  latitude: number | null;
  longitude: number | null;
  distanceKm?: number | null;
}

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './profiles.html',
  styleUrls: ['./profiles.scss']
})
export class Profiles implements OnInit {
  app = inject(App);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  cdr = inject(ChangeDetectorRef);
snackbar = inject(SnackbarService);
  isBrowser = isPlatformBrowser(this.platformId);

  activeTab: TabType = 'browse';
  isLoading = false;
  sidebarFilter = 'all';

  ageFromOptions = [21, 23, 25, 27, 29, 31, 33, 35];
  ageToOptions = [25, 27, 29, 31, 33, 35, 37, 40];
  radiusOptions = [5, 10, 25, 50, 100, 200];
educationOptions: LangText[] = [];
maritalStatusOptions: LangText[] = [];
stateOptions: LangText[] = [];
cityOptions: (LangText & { state: string })[] = [];
religionOptions: LangText[] = [];
casteOptions: (LangText & { religion: string })[] = [];
genderOptions: LangText[] = [];
professionOptions: LangText[] = [];
casteMap: Record<string, string> = {};
  openDropdown: string | null = null;
  mobileFilterOpen = false;
  @ViewChild('filterBar') filterBarRef?: ElementRef<HTMLDivElement>;

  userLat: number | null = null;
  userLng: number | null = null;
  geoLocationReady = false;
  geoLocationDenied = false;

  searchTerms = {
    ageFrom: '',
    ageTo: '',
    religion: '',
    caste: '',
    gender: '',
    maritalStatus: '',
    location: '',
    education: '',
    profession: '',
    state: '',
    radius: ''
  };

  currentPlan = {
    name: 'No Active Plan',
    limit: 0,
    viewed: 0,
    daysLeft: 0,
    expired: true
  };

  currentSubscriptionId = '';
  currentPlanId = '';

 profiles: ProfileItem[] = [];
likedMeProfiles: ProfileItem[] = [];
likedProfilesCount = 0;
likedProfileIdSet = new Set<string>();
  visibleProfileCount = 9;
visibleProfileTimer: any = null;
showProfileLoading = false;
  shortlistedMeUserIds: string[] = [];
    userProfileImage = '';
userProfileName = '';
userGender = '';
userCaste = '';
userNakshatra = '';
  shortlistedByYouIds: string[] = [];

showBiodataPopup = true;
filters = {
  caste: null as string | null,
  religion: null as string | null,
  gender: null as string | null,
  maritalStatus: null as string | null,
  location: null as string | null,
  education: null as string | null,
  profession: null as string | null,
  state: null as string | null,
  ageFrom: null as number | null,
  ageTo: null as number | null,
  radius: null as number | null
};
appliedFilters = {
  caste: null as string | null,
  religion: null as string | null,
  gender: null as string | null,
  maritalStatus: null as string | null,
  location: null as string | null,
  education: null as string | null,
  profession: null as string | null,
  state: null as string | null,
  ageFrom: null as number | null,
  ageTo: null as number | null,
  radius: null as number | null
};

  translations = {
    en: {
      header: {
        miniTitle: 'Matrimony Profiles',
        title: 'Find Your Perfect Match',
        subtitle:
          'Explore genuine and verified profiles tailored for meaningful relationships.'
      },
      tabs: {
        browse: 'All Profiles',
        liked: 'Liked Profiles',
        likedMe: 'Who Liked Me'
      },
      plan: {
        expiresIn: 'Expires in',
        day: 'day',
        days: 'days',
        expiredText: 'Your plan has expired',
        viewed: 'Viewed',
        remaining: 'Remaining',
        status: 'Status',
        usageProgress: 'Usage Progress',
        profilesUsed: 'profiles used',
        upgradeNow: 'Upgrade Now',
        seePlans: 'See Plans',
        renewPlan: 'Renew Plan',
        onlyLeft: 'Only',
        profileViewsLeft: 'profile views left',
        unlockText:
          'Upgrade now to unlock more matching profiles and premium features.',
        subscriptionExpired: 'Your subscription has expired',
        renewText:
          'Renew now to continue viewing profiles and sending interests.',
        active: 'Active',
        lowBalance: 'Low Balance',
        limitReached: 'Limit Reached',
        expired: 'Expired'
      },
      filters: {
        caste: 'Caste',
        religion: 'Religion',
        gender: 'Gender',
        maritalStatus: 'Marital Status',
        location: 'City',
        state: 'State',
        education: 'Education',
        ageFrom: 'Age From',
        ageTo: 'Age To',
        radius: 'Radius (km)',
        nearbyOnly: 'Nearby',
        search: 'Apply Filters',
        reset: 'Reset'
      },
      profile: {
        age: 'Age',
        religion: 'Religion',
        location: 'Location',
        profession: 'Profession',
        education: 'Education',
        maritalStatus: 'Marital Status',
        caste: 'Caste',
        gender: 'Gender',
        distance: 'Distance',
        viewProfile: 'View Profile',
        like: 'Like',
        liked: 'Liked',
        removeLike: 'Remove Like',
        likeBack: 'Like Back',
        likedBadge: 'Liked',
        likedMeBadge: 'Liked You'
      },
      empty: {
        likedTitle: 'No liked profiles yet',
        likedText: 'You can like a profile and see it listed here.',
        likedMeTitle: 'No likes received yet',
        likedMeText: 'Profiles that like you will appear here.',
        browseTitle: 'No matching profiles found',
        browseText: 'Try changing your filters to see more profiles.'
      },
      alerts: {
        planExpired: 'Your plan has expired. Please upgrade.',
        limitReached: 'Profile limit reached. Upgrade your plan.',
        interestSent: 'Interest sent to',
        expiredOnly: 'Your plan has expired.',
        loginRequired: 'Please login or register to view full profile.',
        geoDenied:
          'Location permission denied. Radius filter will use city filter only.',
        geoUnavailable:
          'Unable to get your current location. Radius filter will use city filter only.',
        invalidProfileCode: 'This profile does not have a valid profile code yet.'
      },
sidebar: {
  allMatches: 'All Matches',

  yourMatches: 'Your Matches',
  yourMatchesText: 'View all the profiles that match your preferences',

  basedOnActivity: 'Based on activity',

  shortlistedByYou: 'Shortlisted by you',
  shortlistedByYouText: 'Matches you have shortlisted',

  whoShortlistedYou: 'Who shortlisted you',
  whoShortlistedYouText: 'Members who shortlisted your profile',

  viewedByYou: 'Viewed by you',
  viewedByYouText: 'Matches you have viewed',

  recentlyJoined: 'Recently joined & nearby matches',

  newlyJoined: 'Newly Joined',
  newlyJoinedText: 'Matches who joined within the last 30 days',

  nearbyMatches: 'Nearby matches',
  nearbyMatchesText: 'Matches near your location',

  profileDetails: 'Based on profile details',

  withPhotos: 'Matches with photos',
  withPhotosText: 'Matches that have added photos',

  withHoroscope: 'Matches with horoscope',
  withHoroscopeText: 'Matches that have added horoscope',

  similarHobbies: 'Matches with similar hobbies',
  similarHobbiesText: 'Matches who have hobbies similar to you'

  ,

astroCompatibility: 'Based on astrological compatibility',

starMatches: 'Star matches',
starMatchesText: 'Matches with compatible star sign',

horoscopeMatches: 'Horoscope matches',
horoscopeMatchesText: 'Matches with horoscope matching yours',

lookingForSomeone: 'Members who are looking for someone like you',

mutualMatches: 'Mutual matches',
mutualMatchesText:
  'Matches whose profile match your preferences and vice versa',

lookingForYou: 'Looking for you',
lookingForYouText:
  'Matches whose preferences match your profile',

preferenceMatches: 'Matches based on preferences',

cityPreference: 'City/location preference',
cityPreferenceText:
  'Matches based on your preferred city/location',

nriMatches: 'NRI matches',
nriMatchesText:
  'Matches from outside India',

otherMatches: 'Other matches',

assistedMatches: 'Assisted matches',
assistedMatchesText:
  'Matches whose profiles are handled by a relationship manager'
}
    },
    ta: {
      header: {
        miniTitle: 'திருமண சுயவிவரங்கள்',
        title: 'உங்கள் சரியான வாழ்க்கைத் துணையை கண்டுபிடிக்கவும்',
        subtitle:
          'நம்பகமான மற்றும் சரிபார்க்கப்பட்ட சுயவிவரங்களைப் பார்த்து அர்த்தமுள்ள உறவை உருவாக்குங்கள்.'
      },
      tabs: {
        browse: 'அனைத்து சுயவிவரங்கள்',
        liked: 'பிடித்த சுயவிவரங்கள்',
        likedMe: 'என்னை விரும்பியவர்கள்'
      },
      plan: {
        expiresIn: 'காலாவதி ஆக இன்னும்',
        day: 'நாள்',
        days: 'நாட்கள்',
        expiredText: 'உங்கள் திட்டம் காலாவதியாகிவிட்டது',
        viewed: 'பார்த்தவை',
        remaining: 'மீதமுள்ளவை',
        status: 'நிலை',
        usageProgress: 'பயன்பாட்டு முன்னேற்றம்',
        profilesUsed: 'சுயவிவரங்கள் பயன்படுத்தப்பட்டது',
        upgradeNow: 'இப்போதே மேம்படுத்தவும்',
        seePlans: 'திட்டங்களை பார்க்கவும்',
        renewPlan: 'திட்டத்தை புதுப்பிக்கவும்',
        onlyLeft: 'மட்டும்',
        profileViewsLeft: 'சுயவிவர பார்வைகள் மீதமுள்ளது',
        unlockText:
          'மேலும் பொருத்தமான சுயவிவரங்கள் மற்றும் பிரீமியம் அம்சங்களை பெற இப்போதே மேம்படுத்தவும்.',
        subscriptionExpired: 'உங்கள் சந்தா காலாவதியாகிவிட்டது',
        renewText:
          'சுயவிவரங்களை பார்க்கவும் ஆர்வம் அனுப்பவும் திட்டத்தை புதுப்பிக்கவும்.',
        active: 'செயலில் உள்ளது',
        lowBalance: 'குறைந்த இருப்பு',
        limitReached: 'வரம்பு முடிந்தது',
        expired: 'காலாவதியானது'
      },
      filters: {
        caste: 'ஜாதி',
        religion: 'மதம்',
        gender: 'பாலினம்',
        maritalStatus: 'திருமண நிலை',
        location: 'நகரம்',
        state: 'மாநிலம்',
        education: 'கல்வி',
        ageFrom: 'வயது முதல்',
        ageTo: 'வயது வரை',
        radius: 'அருகிலுள்ள தூரம் (கி.மீ)',
        nearbyOnly: 'அருகில்',
        search: 'வடிகட்டு',
        reset: 'மீட்டமை'
      },
      profile: {
        age: 'வயது',
        religion: 'மதம்',
        location: 'இடம்',
        profession: 'தொழில்',
        education: 'கல்வி',
        maritalStatus: 'திருமண நிலை',
        caste: 'ஜாதி',
        gender: 'பாலினம்',
        distance: 'தூரம்',
        viewProfile: 'சுயவிவரம் பார்க்க',
        like: 'பிடிக்கும்',
        liked: 'பிடித்தது',
        removeLike: 'பிடித்ததை நீக்கு',
        likeBack: 'மீண்டும் விருப்பம் தெரிவி',
        sendInterest: 'ஆர்வம் அனுப்பு',
        likedBadge: 'பிடித்தது',
        likedMeBadge: 'உங்களை விரும்பினார்'
      },
      empty: {
        likedTitle: 'இன்னும் பிடித்த சுயவிவரங்கள் இல்லை',
        likedText: 'ஒரு சுயவிவரத்தை விரும்பினால் அது இங்கே தோன்றும்.',
        likedMeTitle: 'இன்னும் யாரும் விருப்பம் தெரிவிக்கவில்லை',
        likedMeText: 'உங்களை விரும்பிய சுயவிவரங்கள் இங்கே தோன்றும்.',
        browseTitle: 'பொருந்தும் சுயவிவரங்கள் இல்லை',
        browseText: 'மேலும் சுயவிவரங்களை பார்க்க வடிகட்டலை மாற்றவும்.'
      },
      alerts: {
        planExpired: 'உங்கள் திட்டம் காலாவதியாகிவிட்டது. தயவுசெய்து மேம்படுத்தவும்.',
        limitReached: 'சுயவிவர பார்வை வரம்பு முடிந்துவிட்டது. திட்டத்தை மேம்படுத்தவும்.',
        interestSent: 'ஆர்வம் அனுப்பப்பட்டது',
        expiredOnly: 'உங்கள் திட்டம் காலாவதியாகிவிட்டது.',
        loginRequired: 'முழு சுயவிவரத்தை பார்க்க தயவுசெய்து உள்நுழையவும் அல்லது பதிவு செய்யவும்.',
        geoDenied:
          'உங்கள் இருப்பிட அனுமதி மறுக்கப்பட்டது. Radius filter நகர அடிப்படையில் மட்டும் செயல்படும்.',
        geoUnavailable:
          'உங்கள் தற்போதைய இருப்பிடத்தை பெற முடியவில்லை. Radius filter நகர அடிப்படையில் மட்டும் செயல்படும்.',
        invalidProfileCode: 'இந்த profile-க்கு சரியான profile code இன்னும் இல்லை.'
      },
      sidebar: {
  allMatches: 'அனைத்து பொருத்தங்கள்',
  yourMatches: 'உங்கள் பொருத்தங்கள்',
  yourMatchesText: 'உங்கள் விருப்பங்களுக்கு பொருந்தும் அனைத்து சுயவிவரங்களையும் பார்க்கவும்',

  basedOnActivity: 'செயல்பாடுகளின் அடிப்படையில்',
  shortlistedByYou: 'நீங்கள் பிடித்தவர்கள்',
  shortlistedByYouText: 'நீங்கள் பிடித்த சுயவிவரங்கள்',
  whoShortlistedYou: 'உங்களை பிடித்தவர்கள்',
  whoShortlistedYouText: 'உங்கள் சுயவிவரத்தை பிடித்த உறுப்பினர்கள்',
  viewedByYou: 'நீங்கள் பார்த்தவர்கள்',
  viewedByYouText: 'நீங்கள் பார்த்த பொருத்தங்கள்',

  recentlyJoined: 'சமீபத்தில் சேர்ந்தவர்கள் மற்றும் அருகிலுள்ள பொருத்தங்கள்',
  newlyJoined: 'புதிய உறுப்பினர்கள்',
  newlyJoinedText: 'கடந்த 30 நாட்களில் சேர்ந்தவர்கள்',
  nearbyMatches: 'அருகிலுள்ள பொருத்தங்கள்',
  nearbyMatchesText: 'உங்கள் இடத்திற்கு அருகிலுள்ள பொருத்தங்கள்',

  profileDetails: 'சுயவிவர விவரங்களின் அடிப்படையில்',
  withPhotos: 'புகைப்படம் உள்ளவர்கள்',
  withPhotosText: 'புகைப்படம் சேர்த்துள்ள பொருத்தங்கள்',
  withHoroscope: 'ஜாதகம் உள்ளவர்கள்',
  withHoroscopeText: 'ஜாதகம் சேர்த்துள்ள பொருத்தங்கள்',
  similarHobbies: 'ஒத்த பொழுதுபோக்கு உள்ளவர்கள்',
  similarHobbiesText: 'உங்களுடன் ஒத்த பொழுதுபோக்குகள் உள்ளவர்கள்',
  

astroCompatibility: 'ஜோதிட பொருத்தத்தின் அடிப்படையில்',

starMatches: 'நட்சத்திர பொருத்தங்கள்',
starMatchesText:
  'உங்கள் நட்சத்திரத்துடன் பொருந்தும் பொருத்தங்கள்',

horoscopeMatches: 'ஜாதக பொருத்தங்கள்',
horoscopeMatchesText:
  'உங்கள் ஜாதகத்துடன் பொருந்தும் பொருத்தங்கள்',

lookingForSomeone:
  'உங்களைப் போன்றவரை தேடுகிற உறுப்பினர்கள்',

mutualMatches: 'இருவருக்கும் பொருத்தமானவர்கள்',
mutualMatchesText:
  'உங்கள் விருப்பங்களும் அவர்களின் விருப்பங்களும் பொருந்தும் உறுப்பினர்கள்',

lookingForYou: 'உங்களை தேடுபவர்கள்',
lookingForYouText:
  'உங்கள் சுயவிவரத்துடன் பொருந்தும் விருப்பங்கள் கொண்டவர்கள்',

preferenceMatches:
  'விருப்பங்களின் அடிப்படையிலான பொருத்தங்கள்',

cityPreference: 'நகரம் / இட விருப்பம்',
cityPreferenceText:
  'நீங்கள் தேர்ந்தெடுத்த நகரம் / இடத்தின் அடிப்படையிலான பொருத்தங்கள்',

nriMatches: 'வெளிநாட்டு பொருத்தங்கள்',
nriMatchesText:
  'இந்தியாவிற்கு வெளியே உள்ள பொருத்தங்கள்',

otherMatches: 'மற்ற பொருத்தங்கள்',

assistedMatches: 'உதவி செய்யப்பட்ட பொருத்தங்கள்',
assistedMatchesText:
  'உறவு மேலாளரால் நிர்வகிக்கப்படும் சுயவிவரங்கள்'
}
    }
  };

  async ngOnInit(): Promise<void> {
    this.activeTab = 'browse';
    this.sidebarFilter = 'all';
    this.resetFilters();

    this.isLoading = true;
    this.cdr.detectChanges();


    await this.loadCurrentPlanFromSupabase();
    await this.loadLoggedInUserProfile();
    await this.refreshUserProfileLanguage();

await Promise.all([
  this.loadEducationOptions(),
  this.loadFilterTables()
]);


await this.loadProfilesFromSupabase();

await this.loadLikedProfiles();
await this.loadLikedMeProfiles();

this.loadShortlistedByYouFromSupabase();
this.loadShortlistedMeFromSupabase();


    this.cdr.detectChanges();

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

get currentLang(): 'en' | 'ta' {
  return this.app.currentLang;
}

  get tr() {
    return this.translations[this.currentLang];
  }

asLangText(value: string | null | undefined): LangText {
    const text = value?.trim() || '';
  return {
    en: text,
    ta: text
  };
}

private asLangTextTa(
  enValue: string | null | undefined,
  taValue: string | null | undefined
): LangText {
  const en = enValue?.trim() || '';
  const ta = taValue?.trim() || en;

  return { en, ta };
}

private hasTamilText(value: string | null | undefined): boolean {
  return /[\u0B80-\u0BFF]/.test(String(value || ''));
}

private async translateText(
  text: string | null | undefined,
  target: 'en' | 'ta'
): Promise<string> {
  const value = String(text || '').trim();
  if (!value) return '';

  const { data, error } = await supabase.functions.invoke('translate-text', {
    body: { text: value, target }
  });

  if (error) return value;

  return data?.translatedText || value;
}

private async makeLangText(
  enValue: string | null | undefined,
  taValue: string | null | undefined
): Promise<LangText> {
  let en = String(enValue || '').trim();
  let ta = String(taValue || '').trim();

  if (this.hasTamilText(en)) {
    en = await this.translateText(en, 'en');
  }

  if (!ta && en) {
    ta = await this.translateText(en, 'ta');
  }

  return { en, ta: ta || en };
}

  private normalizeText(value: string | null | undefined): string {
    return String(value || '').toLowerCase().trim();
  }

  private toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  private hasRealProfileCode(id: string): boolean {
    return /^AMI-/i.test(String(id || '').trim());
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
      console.error('Error reading matrimony_user from localStorage:', error);
    }

    const stored = localStorage.getItem('app_user_id');
    return stored ? String(stored) : null;
  }

  private getUserStorageKey(key: string): string {
    const userId = this.getLoggedInUserId();
    return userId ? `${key}_${userId}` : key;
  }

  private getDaysLeft(endDate: string | null | undefined): number {
    if (!endDate) return 0;

    const today = new Date();
    const end = new Date(endDate);

    if (isNaN(end.getTime())) return 0;

    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffMs = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 0);
  }

  get isLoggedIn(): boolean {
    return !!this.getLoggedInUserId();
  }

  tryGetUserLocation(): void {
  if (!this.isBrowser || !('geolocation' in navigator)) {
  return;
}

  navigator.geolocation.getCurrentPosition(
  (position) => {
    this.userLat = position.coords.latitude;
    this.userLng = position.coords.longitude;
    this.geoLocationReady = true;
    this.geoLocationDenied = false;

    // ✅ ADD THIS PART ONLY
    this.profiles = this.profiles.map(profile => ({
      ...profile,
      distanceKm: this.getDistanceForProfile(profile)
    }));

    this.applyFilters?.();

    this.cdr.detectChanges();
  },
      (error) => {
        console.warn('Geolocation error:', error);
     // do nothing
        this.cdr.detectChanges();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  getDistanceForProfile(profile: ProfileItem): number | null {
    if (
      this.userLat === null ||
      this.userLng === null ||
      profile.latitude === null ||
      profile.longitude === null
    ) {
      return null;
    }

    return this.calculateDistanceKm(
      this.userLat,
      this.userLng,
      profile.latitude,
      profile.longitude
    );
  }

  private getCityCenterByName(cityName: string | null | undefined): { lat: number; lng: number } | null {
    const normalizedCity = this.normalizeText(cityName);
    if (!normalizedCity) return null;

    const matchingProfiles = this.profiles.filter((profile) => {
      const profileCity = this.normalizeText(this.getText(profile.city));
      return (
        profileCity === normalizedCity &&
        profile.latitude !== null &&
        profile.longitude !== null
      );
    });

    if (matchingProfiles.length === 0) return null;

    const total = matchingProfiles.reduce(
      (acc, profile) => {
        acc.lat += profile.latitude ?? 0;
        acc.lng += profile.longitude ?? 0;
        return acc;
      },
      { lat: 0, lng: 0 }
    );

    return {
      lat: total.lat / matchingProfiles.length,
      lng: total.lng / matchingProfiles.length
    };
  }

  private getDistanceFromSelectedCity(profile: ProfileItem): number | null {
    const selectedCityCenter = this.getCityCenterByName(this.appliedFilters.location);

    if (
      !selectedCityCenter ||
      profile.latitude === null ||
      profile.longitude === null
    ) {
      return null;
    }

    return this.calculateDistanceKm(
      selectedCityCenter.lat,
      selectedCityCenter.lng,
      profile.latitude,
      profile.longitude
    );
  }

  formatDistance(distance: number | null | undefined): string {
    if (distance === null || distance === undefined || !Number.isFinite(distance)) {
      return '-';
    }
    return `${distance.toFixed(1)} km`;
  }

  async loadCurrentPlanFromSupabase(): Promise<void> {
    const userId = this.getLoggedInUserId();

    if (!userId) {
      this.currentPlan = {
        name: 'No Active Plan',
        limit: 0,
        viewed: 0,
        daysLeft: 0,
        expired: true
      };
      this.currentSubscriptionId = '';
      this.currentPlanId = '';
      this.cdr.detectChanges();
      return;
    }

    try {
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select(`
          subscription_id,
          user_id,
          plan_id,
          subscription_status_id,
          start_date,
          end_date,
          contacts_used,
          total_contacts_allowed,
          is_active,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (subscriptionError) throw subscriptionError;

      const subscriptionList = Array.isArray(subscriptions) ? subscriptions : [];

      const activeSubscription =
        subscriptionList.find((item: any) => item?.is_active === true) ||
        subscriptionList[0];

      if (!activeSubscription) {
        this.currentPlan = {
          name: 'No Active Plan',
          limit: 0,
          viewed: 0,
          daysLeft: 0,
          expired: true
        };
        this.currentSubscriptionId = '';
        this.currentPlanId = '';
        this.cdr.detectChanges();
        return;
      }

      const { data: planRow, error: planError } = await supabase
        .from('mst_plans')
        .select('plan_id, plan_name')
        .eq('plan_id', activeSubscription.plan_id)
        .maybeSingle();

      if (planError) throw planError;

      const daysLeft = this.getDaysLeft(activeSubscription.end_date);
      const totalAllowed = Number(activeSubscription.total_contacts_allowed || 0);
      const contactsUsed = Number(activeSubscription.contacts_used || 0);

      const expired =
        !activeSubscription.is_active ||
        daysLeft <= 0 ||
        (totalAllowed > 0 && contactsUsed >= totalAllowed);

      this.currentSubscriptionId = activeSubscription.subscription_id || '';
      this.currentPlanId = activeSubscription.plan_id || '';

      this.currentPlan = {
        name: planRow?.plan_name || 'Active Plan',
        limit: totalAllowed,
        viewed: contactsUsed,
        daysLeft,
        expired
      };

      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Load current plan error:', error);
      this.currentPlan = {
        name: 'No Active Plan',
        limit: 0,
        viewed: 0,
        daysLeft: 0,
        expired: true
      };
      this.currentSubscriptionId = '';
      this.currentPlanId = '';
      this.cdr.detectChanges();
    }
  }

  async loadProfilesFromSupabase(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
     const { data, error } = await supabase
  .from('user_profiles')
.select(`
  user_id,
  profile_id,
  profile_code,
  dob,
  full_name,
  full_name_ta,

  age,

  religion_text,

  location_text,

  occupation_text,
  occupation_text_ta,

  education_text,
  education_text_ta,

  marital_status_text,

  caste_text,

  gender_text,
  nakshatra_text,
nakshatra_text_ta,

  city_text,

  state_text,

  country_text,

  profile_image_url,
  latitude,
  longitude,
  is_published,
  profile_status,
  updated_at
`)
 .eq('profile_status', 'Approved')
  .eq('is_published', true)
  .order('updated_at', { ascending: false });

      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];

      const filteredRows = rows
        .filter((row: any) => {
const loggedInUserId = String(this.getLoggedInUserId() || '').trim();
const rowUserId = String(row.user_id || '').trim();

const loggedInName = String(this.userProfileName || '').toLowerCase().trim();
const rowName = String(row.full_name || '').toLowerCase().trim();

if (
  (loggedInUserId && rowUserId === loggedInUserId) ||
  (loggedInName && rowName === loggedInName)
) {
  return false;
}
          if (!row) return false;

          const status = String(row.profile_status || '').toLowerCase().trim();
          if (status === 'draft') return false;

          const usableId = row.profile_id || '';
          return !!usableId;
        })
//         .map((row: any) => {
//           const usableId = row.profile_code || row.user_id || row.profile_id || '';

//           const cityValue =
//             String(row.city_text || '').trim() ||
//             String(row.location_text || '').split(',')[0]?.trim() ||
//             '';

//           const fullLocation =
//             String(row.location_text || '').trim() ||
//             [row.city_text, row.state_text, row.country_text]
//               .filter(Boolean)
//               .map((item: any) => String(item).trim())
//               .filter(Boolean)
//               .join(', ');

//           return {
//             id: String(usableId).trim(),
//             userId: String(row.user_id || '').trim(),
//           name: this.asLangTextTa(
//   row.full_name,
//   row.full_name_ta
// ),


//             age: Number(row.age || 0),
//            religion: this.asLangTextTa(
//   row.religion_text,
//   this.getTamilProfileValue('religion', row.religion_text)
// ),

// profession: this.asLangTextTa(
//   row.occupation_text,
//   row.occupation_text_ta ||
//   this.getTamilProfileValue('profession', row.occupation_text)
// ),

// education: this.asLangTextTa(
//   row.education_text,
//   row.education_text_ta ||
//   this.getTamilProfileValue('education', row.education_text)
// ),

// maritalStatus: this.asLangTextTa(
//   row.marital_status_text,
//   this.getTamilProfileValue('maritalStatus', row.marital_status_text)
// ),

// caste: this.asLangTextTa(
//   row.caste_text,
//   this.casteMap[
//     String(row.caste_text || '').trim().toLowerCase()
//   ] || row.caste_text
// ),
// gender: this.asLangTextTa(
//   row.gender_text,
//   this.getTamilProfileValue('gender', row.gender_text)
// ),

//             image: row.profile_image_url || 'assets/default-avatar.png',
//             liked: false,
//             latitude: this.toNullableNumber(row.latitude),
//             longitude: this.toNullableNumber(row.longitude),
//             distanceKm: null
//           } as ProfileItem;
//         });
this.profiles = await Promise.all(
  filteredRows.map(async (row: any) => {
  const usableId = row.profile_code || row.user_id || row.profile_id || '';



return {
  id: String(row.profile_code || '').trim(),
  profileId: String(row.profile_id || '').trim(),
  userId: String(row.user_id || '').trim(),
  dob: row.dob || null,
      name: await this.makeLangText(row.full_name, row.full_name_ta),
      age: Number(row.age || 0),
religion: await this.makeLangText(
  row.religion_text || '-',
  this.getTamilProfileValue('religion', row.religion_text)
),

maritalStatus: await this.makeLangText(
  row.marital_status_text || '-',
  this.getTamilProfileValue('maritalStatus', row.marital_status_text)
),

caste: await this.makeLangText(
  row.caste_text || '-',
  this.casteMap[String(row.caste_text || '').trim().toLowerCase()] || row.caste_text
),

gender: await this.makeLangText(
  row.gender_text || '-',
  this.getTamilProfileValue('gender', row.gender_text)
),
nakshatra: await this.makeLangText(
  row.nakshatra_text,
  row.nakshatra_text_ta || row.nakshatra_text
),

location: await this.makeLangText(
  row.city_text || row.location_text,
  row.city_text || row.location_text
),
city: await this.makeLangText(row.city_text, row.city_text),
state: await this.makeLangText(row.state_text, row.state_text),

education: await this.makeLangText(
  row.education_text || '-',
  row.education_text_ta || this.getTamilProfileValue('education', row.education_text)
),

profession: await this.makeLangText(
  row.occupation_text || '-',
  row.occupation_text_ta || this.getTamilProfileValue('profession', row.occupation_text)
),

image: row.profile_image_url || 'assets/default-avatar.png',
      liked: false,
      latitude: this.toNullableNumber(row.latitude),
      longitude: this.toNullableNumber(row.longitude),
      distanceKm: null
    } as ProfileItem;
  })
);

      this.likedMeProfiles = [];

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Load profiles error:', error);
      this.profiles = [];
      this.cdr.detectChanges();
    } finally {
  this.isLoading = false;

  setTimeout(() => {
    this.startProfileBatchLoading();
    this.cdr.detectChanges();
  }, 0);
}
  }
private getTamilProfileValue(
  type: string,
  value: string | null | undefined
): string {

  const text = String(value || '').trim();

  const map: any = {

    gender: {
      Male: 'ஆண்',
      Female: 'பெண்'
    },

   maritalStatus: {
  Unmarried: 'திருமணம் ஆகாதவர்',
  Divorced: 'விவாகரத்து',
  Widowed: 'விதவை'
},
    religion: {
      Hindu: 'இந்து',
      Christian: 'கிறிஸ்துவர்',
      Muslim: 'முஸ்லிம்'
    },

   education: {
  BCom: 'பி.காம்',
  BTech: 'பி.டெக்',
  BE: 'பி.இ',
  MBA: 'எம்.பி.ஏ'
},

profession: {
  developer: 'டெவலப்பர்',
  look: 'லுக்',
  'software engineer': 'மென்பொருள் பொறியாளர்',
  teacher: 'ஆசிரியர்',
  doctor: 'மருத்துவர்'
},



  };

  return map[type]?.[text] || text;
}
  async loadShortlistedMeFromSupabase(): Promise<void> {
    const userId = this.getLoggedInUserId();

    if (!userId) {
      this.shortlistedMeUserIds = [];
      this.cdr.detectChanges();
      return;
    }

    try {
      const { data: myProfile, error: myProfileError } = await supabase
        .from('user_profiles')
        .select('user_id, profile_id, profile_code')
        .eq('user_id', userId)
        .maybeSingle();

      if (myProfileError) throw myProfileError;

      const myProfileIds = [
        myProfile?.profile_code,
        myProfile?.user_id,
        myProfile?.profile_id
      ]
        .filter((item) => item !== null && item !== undefined && item !== '')
        .map((item) => String(item).trim());

      if (myProfileIds.length === 0) {
        this.shortlistedMeUserIds = [];
        this.cdr.detectChanges();
        return;
      }

      const { data, error } = await supabase
        .from('matrimony_shortlists')
        .select('user_id, profile_id')
        .in('profile_id', myProfileIds);

      if (error) throw error;

      this.shortlistedMeUserIds = [
        ...new Set(
          (Array.isArray(data) ? data : [])
            .map((item: any) => String(item?.user_id || '').trim())
            .filter((shortlisterId: string) => !!shortlisterId && shortlisterId !== userId)
        )
      ];

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Load shortlisted me error:', error);
      this.shortlistedMeUserIds = [];
      this.cdr.detectChanges();
    }
  }

async loadShortlistedByYouFromSupabase(): Promise<void> {
  const userId = this.getLoggedInUserId();

  if (!userId) {
    this.shortlistedByYouIds = [];
    return;
  }

  const { data, error } = await supabase
    .from('matrimony_shortlists')
    .select('profile_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Load shortlisted by you error:', error);
    this.shortlistedByYouIds = [];
    return;
  }

  this.shortlistedByYouIds = (data || [])
    .map((x: any) => String(x.profile_id || '').trim())
    .filter(Boolean);

this.profiles = this.profiles.map(profile => ({
  ...profile
}));

  this.cdr.detectChanges();
}
async loadLikedProfiles(): Promise<void> {
  const userId = this.getLoggedInUserId();

  if (!userId) {
    this.likedProfilesCount = 0;
    this.likedProfileIdSet.clear();
    return;
  }

  try {
    const { data: myProfile, error: myProfileError } = await supabase
      .from('user_profiles')
      .select('profile_id')
      .eq('user_id', userId)
      .single();

    if (myProfileError) throw myProfileError;
    if (!myProfile?.profile_id) return;

    const myProfileId = String(myProfile.profile_id);

    const { data, error } = await supabase
      .from('profile_likes')
      .select('to_profile_id')
      .eq('from_profile_id', myProfileId);

    if (error) throw error;

    const likedIds = (data || []).map((x: any) => String(x.to_profile_id));
    if (likedIds.length === 0) {
  this.likedProfilesCount = 0;

  this.profiles = this.profiles.map(profile => ({
    ...profile,
    liked: false
  }));

  this.cdr.detectChanges();
  return;
}

    this.likedProfileIdSet = new Set(likedIds);
   this.likedProfilesCount = this.profiles.filter(
  profile => this.likedProfileIdSet.has(profile.profileId)
).length;

    this.profiles = this.profiles.map(profile => ({
      ...profile,
      liked: this.likedProfileIdSet.has(profile.profileId)
    }));

    this.cdr.detectChanges();
  } catch (err) {
    console.error('Load liked profiles error:', err);
  }
}
async loadLikedMeProfiles(): Promise<void> {

  const userId = this.getLoggedInUserId();

  if (!userId) {
    this.likedMeProfiles = [];
    return;
  }

  try {

    const { data: myProfile } = await supabase
      .from('user_profiles')
      .select('profile_id')
      .eq('user_id', userId)
      .single();

    if (!myProfile) return;

    const myProfileId = String(myProfile.profile_id);

    const { data, error } = await supabase
      .from('profile_likes')
      .select('from_profile_id')
      .eq('to_profile_id', myProfileId);

    if (error) throw error;

    const likedMeIds = (data || []).map((x: any) =>
      String(x.from_profile_id)
    );

    this.likedMeProfiles = this.profiles.filter(profile =>
      likedMeIds.includes(profile.profileId)
    );

  } catch (err) {

    console.error(err);

  }
}
startProfileBatchLoading(): void {
  if (!this.isBrowser) return;

  if (this.visibleProfileTimer) {
    clearTimeout(this.visibleProfileTimer);
    this.visibleProfileTimer = null;
  }

  this.visibleProfileCount = 9;
  this.cdr.detectChanges();
}
loadMoreProfilesAfterScroll(): void {
  if (!this.isBrowser) return;
  if (this.visibleProfileTimer) return;
  if (this.visibleProfileCount >= this.filteredProfiles.length) return;

  this.showProfileLoading = true;
  this.cdr.detectChanges();

  this.visibleProfileTimer = setTimeout(() => {
    this.visibleProfileCount += 9;
    this.showProfileLoading = false;
    this.visibleProfileTimer = null;

    this.cdr.detectChanges();
    this.cdr.markForCheck();
  }, 1500);
}
@HostListener('window:scroll', [])
onWindowScroll(): void {

  if (!this.isBrowser) return;

  if (this.activeTab !== 'browse') return;

  if (this.isLoading) return;

  const scrollPosition = window.innerHeight + window.scrollY;

  const pageHeight = document.documentElement.scrollHeight;

  if (scrollPosition >= pageHeight - 300) {

    this.loadMoreProfilesAfterScroll();

    this.cdr.detectChanges();

  }

}

  applySidebarFilter(type: string): void {
    const protectedFilters = [
  'liked',
  'shortlistedMe',
  'viewedByYou',
  'mutual',
  'lookingForYou'
];

if (!this.isLoggedIn && protectedFilters.includes(type)) {
  this.snackbar.error('Please login or register');
  this.router.navigate(['/login']);
  return;
}
    this.sidebarFilter = type;

    if (type === 'all') {
      this.resetFilters();
      this.sidebarFilter = 'all';
      return;
    }

    if (type === 'nearby') {
      this.appliedFilters.radius = this.appliedFilters.radius || 50;
    }

    this.cdr.detectChanges();
  }

 
  get planExpired(): boolean {
    return this.currentPlan.expired;
  }
get hasNoPlan(): boolean {
  return (
    this.currentPlan.name === 'No Active Plan' ||
    this.profileLimit <= 0
  );
}
  get daysLeft(): number {
    return this.currentPlan.daysLeft;
  }

  get profileLimit(): number {
    return this.currentPlan.limit;
  }

  get viewedProfiles(): number {
    return this.currentPlan.viewed;
  }

  get remainingProfiles(): number {
    return Math.max(this.profileLimit - this.viewedProfiles, 0);
  }

  get usagePercent(): number {
    if (this.profileLimit <= 0) return 0;
    return Math.min((this.viewedProfiles / this.profileLimit) * 100, 100);
  }

  get isLowBalance(): boolean {
    return this.remainingProfiles > 0 && this.remainingProfiles <= 5;
  }

get planStatus(): string {

  const tr = this.tr.plan;

  if (this.hasNoPlan) {
    return 'No Plan';
  }

  if (this.planExpired) {
    return tr.expired;
  }

  if (this.remainingProfiles <= 0 && this.profileLimit > 0) {
    return tr.limitReached;
  }

  if (this.isLowBalance) {
    return tr.lowBalance;
  }

  return tr.active;
}
  getPlanClass(): string {
    const name = (this.currentPlan?.name || '').toLowerCase().trim();

    if (name === 'astro alliance') return 'plan-basic';
    if (name === 'tm classic') return 'plan-classic';
    if (name === 'tm premium') return 'plan-premium';
    if (name === 'tm elite') return 'plan-elite';

    return 'plan-default';
  }

  get likedProfiles(): ProfileItem[] {
    return this.profiles.filter(profile => profile.liked);
  }

  get filteredProfiles(): ProfileItem[] {
    const radius = this.appliedFilters.radius;
const userLat = this.userLat;
const userLng = this.userLng;
if (this.sidebarFilter === 'shortlistedMe') {
  return this.profiles.filter(profile =>
    this.shortlistedMeUserIds.includes(profile.userId)
  );
}
if (this.sidebarFilter === 'shortlistedByYou') {
  return this.profiles.filter(profile =>
    this.shortlistedByYouIds.includes(profile.id)
  );
}
if (this.sidebarFilter === 'liked') {
  return this.profiles.filter(profile => profile.liked === true);
}
    const result = this.profiles.filter((profile) => {
      const religion = this.normalizeText(this.getText(profile.religion));
      const city = this.normalizeText(this.getText(profile.city));
      const state = this.normalizeText(this.getText(profile.state));
      const education = this.normalizeText(this.getText(profile.education));
      const profession = this.normalizeText(this.getText(profile.profession));
      const maritalStatus = this.normalizeText(this.getText(profile.maritalStatus));
      const caste = this.normalizeText(this.getText(profile.caste));
      const gender = this.normalizeText(this.getText(profile.gender));
      const casteFilter = this.normalizeText(this.appliedFilters.caste);
      const religionFilter = this.normalizeText(this.appliedFilters.religion);
      const genderFilter = this.normalizeText(this.appliedFilters.gender);
      const maritalStatusFilter = this.normalizeText(this.appliedFilters.maritalStatus);
      const locationFilter = this.normalizeText(this.appliedFilters.location);
      const stateFilter = this.normalizeText(this.appliedFilters.state);
      const educationFilter = this.normalizeText(this.appliedFilters.education);
      const professionFilter = this.normalizeText(this.appliedFilters.profession);
      const radiusFilter = this.appliedFilters.radius;

      const matchesCaste = !casteFilter || caste === casteFilter;
      const matchesReligion = !religionFilter || religion === religionFilter;
      const matchesGender = !genderFilter || gender === genderFilter;
      const matchesMaritalStatus = !maritalStatusFilter || maritalStatus === maritalStatusFilter;
      const matchesEducation = !educationFilter || education === educationFilter;
      const matchesProfession = !professionFilter || profession === professionFilter;
      const matchesState = !stateFilter || state === stateFilter;
      const matchesAgeFrom =
        this.appliedFilters.ageFrom === null || profile.age >= this.appliedFilters.ageFrom;
      const matchesAgeTo =
        this.appliedFilters.ageTo === null || profile.age <= this.appliedFilters.ageTo;

     
let matchesLocation = true;

if (locationFilter) {
  matchesLocation = city === locationFilter;
}

if (matchesLocation && radiusFilter !== null && radiusFilter > 0) {

  if (
    this.userLat == null ||
    this.userLng == null ||
    profile.latitude == null ||
    profile.longitude == null
  ) {
    matchesLocation = false;
  } else {

    const distance = this.calculateDistanceKm(
      this.userLat,
      this.userLng,
      profile.latitude,
      profile.longitude
    );

    profile.distanceKm = distance;

    matchesLocation = distance <= radiusFilter;
  }
}

      return (
        matchesCaste &&
        matchesReligion &&
        matchesGender &&
        matchesMaritalStatus &&
        matchesLocation &&
        matchesState &&
        matchesEducation &&
        matchesProfession &&
        matchesAgeFrom &&
        matchesAgeTo
      );
    });

    const sidebarFiltered = result.filter((profile) => {
      if (this.sidebarFilter === 'all') return true;

 if (this.sidebarFilter === 'liked') {
  return profile.liked === true;
}

    if (this.sidebarFilter === 'shortlistedMe') {
 return this.shortlistedMeUserIds.includes(profile.id);
}

      if (this.sidebarFilter === 'viewedByYou' || this.sidebarFilter === 'viewed') {
        if (!this.isBrowser) return false;

        const viewedIds = JSON.parse(
          localStorage.getItem(this.getUserStorageKey('tm_viewed_profiles')) || '[]'
        ) as string[];

        return viewedIds.includes(profile.id);
      }

      if (this.sidebarFilter === 'newlyJoined') {
        
        return true;
      }

      if (this.sidebarFilter === 'nearby') {
        const distance = this.getDistanceForProfile(profile);
        return distance !== null && distance <= 50;
      }

      if (this.sidebarFilter === 'photos') {
        return !!profile.image && profile.image !== 'assets/default-avatar.png';
      }

      if (this.sidebarFilter === 'education') {
        return !!this.getText(profile.education);
      }

      if (this.sidebarFilter === 'profession') {
        return !!this.getText(profile.profession);
      }

      if (this.sidebarFilter === 'location') {
        return !!this.getText(profile.location);
      }

      if (this.sidebarFilter === 'nri') {
        return !this.normalizeText(this.getText(profile.location)).includes('india');
      }

      if (this.sidebarFilter === 'mutual') {
        return profile.liked === true;
      }

      if (this.sidebarFilter === 'lookingForYou') {
        return true;
      }
      if (this.sidebarFilter === 'star') {
  const myStar = this.normalizeText(this.userNakshatra);
  const profileStarEn = this.normalizeText(profile.nakshatra?.en);
  const profileStarTa = this.normalizeText(profile.nakshatra?.ta);

  if (!myStar) {
    return false;
  }

  return profileStarEn === myStar || profileStarTa === myStar;
}

      return true;
    });

    return sidebarFiltered
      .map((profile) => {
        let distanceKm: number | null = null;

        if (this.appliedFilters.radius !== null && this.appliedFilters.radius > 0) {
          if (this.appliedFilters.location) {
            distanceKm = this.getDistanceFromSelectedCity(profile);
          } else {
            distanceKm = this.getDistanceForProfile(profile);
          }
        }

        return {
          ...profile,
          distanceKm
        };
      })
     .sort((a, b) => {
  const myCaste = this.normalizeText(this.userCaste);

  const casteA = this.normalizeText(this.getText(a.caste));
  const casteB = this.normalizeText(this.getText(b.caste));

  const aSameCaste = myCaste && casteA === myCaste;
  const bSameCaste = myCaste && casteB === myCaste;

  if (aSameCaste && !bSameCaste) return -1;
  if (!aSameCaste && bSameCaste) return 1;

  const radiusActive = this.appliedFilters.radius !== null;
  if (!radiusActive) return 0;

  const aDistance = a.distanceKm ?? Number.MAX_SAFE_INTEGER;
  const bDistance = b.distanceKm ?? Number.MAX_SAFE_INTEGER;
  return aDistance - bDistance;
});
  }




async loadEducationOptions(): Promise<void> {
  const { data, error } = await supabase
    .from('mst_education_levels')
    .select('education_name, education_name_ta')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Education load error', error);
    this.educationOptions = [];
    return;
  }

  this.educationOptions = (data || [])
    .map((x: any) => ({
      en: String(x.education_name || '').trim(),
      ta: String(x.education_name_ta || x.education_name || '').trim()
    }))
    .filter((x: LangText) => x.en);

  this.cdr.detectChanges();
}

async loadFilterTables(): Promise<void> {
const { data: maritalData, error: maritalError } = await supabase
  .from('mst_marital_statuses')
  .select('status_name')
  .eq('is_active', true)
  .order('sort_order', { ascending: true });

if (!maritalError) {
  this.maritalStatusOptions = (maritalData || [])
    .map((x: any) => {
      const en = String(x.status_name || '').trim();

      return {
        en,
        ta: this.getTamilProfileValue('maritalStatus', en)
      };
    })
    .filter((x: LangText) => x.en);
}

  const { data: stateData, error: stateError } = await supabase
    .from('mst_states')
    .select('state_name, state_name_ta')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!stateError) {
    this.stateOptions = (stateData || [])
      .map((x: any) => ({
        en: String(x.state_name || '').trim(),
        ta: String(x.state_name_ta || x.state_name || '').trim()
      }))
      .filter((x: LangText) => x.en);
  }

  const { data: cityData, error: cityError } = await supabase
    .from('mst_cities')
    .select(`
  city_name,
  city_name_ta,
  mst_states (
    state_name
  )
`)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!cityError) {
   this.cityOptions = (cityData || [])
  .map((x: any) => ({
    en: String(x.city_name || '').trim(),
    ta: String(x.city_name_ta || x.city_name || '').trim(),
    state: String(x.mst_states?.state_name || '').toLowerCase().trim()
  }))
      .filter((x: LangText) => x.en);
  }

  const { data: religionData, error: religionError } = await supabase
    .from('mst_religions')
    .select('religion_name, religion_name_ta')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!religionError) {
    this.religionOptions = (religionData || [])
      .map((x: any) => ({
        en: String(x.religion_name || '').trim(),
        ta: String(x.religion_name_ta || x.religion_name || '').trim()
      }))
      .filter((x: LangText) => x.en);
  }

  const { data: casteData, error: casteError } = await supabase
   .from('mst_castes')
.select(`
  caste_name,
  caste_name_ta,
  mst_religions (
    religion_name
  )
`)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!casteError) {
 this.casteOptions = (casteData || [])
  .map((x: any) => ({
    en: String(x.caste_name || '').trim(),
    ta: String(x.caste_name_ta || x.caste_name || '').trim(),
    religion: String(x.mst_religions?.religion_name || '').toLowerCase().trim()
  }))
  .filter((x: LangText & { religion: string }) => x.en);

    this.casteMap = {};

    this.casteOptions.forEach((x) => {
      this.casteMap[x.en.toLowerCase()] = x.ta || x.en;
    });
  }

const { data: genderData, error: genderError } = await supabase
  .from('mst_genders')
  .select('gender_name')
  .eq('is_active', true)
  .order('sort_order', { ascending: true });

if (!genderError) {
  this.genderOptions = (genderData || [])
    .map((x: any) => {
      const en = String(x.gender_name || '').trim();

      return {
        en,
        ta: this.getTamilProfileValue('gender', en)
      };
    })
    .filter((x: LangText) => x.en);
}
const { data: professionData, error: professionError } = await supabase
  .from('mst_professions')
  .select('profession_name, profession_name_ta')
  .eq('is_active', true)
  .order('sort_order', { ascending: true });

if (!professionError) {
  this.professionOptions = (professionData || [])
    .map((x: any) => ({
      en: String(x.profession_name || '').trim(),
      ta: String(x.profession_name_ta || x.profession_name || '').trim()
    }))
    .filter((x: LangText) => x.en);
}
  this.cdr.detectChanges();
}
getFilteredCasteOptions(): (LangText & { religion: string })[] {
  const search = String(this.searchTerms.caste || '').toLowerCase().trim();
  const selectedReligion = String(this.filters.religion || '').toLowerCase().trim();

  return this.casteOptions.filter((item) => {
    const casteName = this.getText(item).toLowerCase();
    const matchesSearch = !search || casteName.includes(search);
    const matchesReligion = !selectedReligion || item.religion === selectedReligion;

    return matchesSearch && matchesReligion;
  });
}
  getText(value: string | LangText): string {
    if (typeof value === 'string') return value;
    return value?.[this.currentLang] || value?.en || '';
  }
getDistrictOnly(location: string): string {

  if (!location) return '-';

  const parts = location
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);

  return parts[0] || '-';
}
getUniqueOptions(list: ProfileItem[], key: keyof ProfileItem): string[] {
  const values = list
    .map(item => this.getText(item[key] as string | LangText))
    .map(value => {
      const text = String(value || '').trim().toLowerCase();

      if (
        text === '' ||
        text === '-' ||
        text === 'null' ||
        text === 'nil' ||
        text === 'nill' ||
        text === 'undefined' ||
        text === 'n/a' ||
        text === 'unworking' ||
        text === 'no job'
      ) {
        return 'Not Working';
      }

      return String(value || '').trim();
    })
    .filter(Boolean);

  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

  toggleDropdown(name: string, event: Event): void {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === name ? null : name;
  }
private getNextDropdown(field: string): string | null {

  const order: Record<string, string | null> = {

    ageFrom: 'ageTo',

    ageTo: 'religion',

    religion: 'caste',

    caste: 'gender',

    gender: 'maritalStatus',

    maritalStatus: 'state',

    state: 'location',

    location: 'radius',

    radius: 'education',

    education: 'profession',

    profession: null

  };

  return order[field] || null;
}
selectOption(
  field:
    | 'caste'
    | 'religion'
    | 'gender'
    | 'maritalStatus'
    | 'location'
    | 'education'
    | 'profession'
    | 'state',

  value: string
): void {

  this.filters[field] = value;

  this.appliedFilters = {
    ...this.filters
  };

const next = this.getNextDropdown(field);

this.openDropdown = next;

this.cdr.detectChanges();

if (next) {
  this.scrollFilterToDropdown(next);
} else {
  this.scrollFilterToDropdown('apply');
}
}

selectNumberOption(
  field: 'ageFrom' | 'ageTo' | 'radius',
  value: number | null
): void {

  this.filters[field] = value;

  this.appliedFilters = {
    ...this.filters
  };

const next = this.getNextDropdown(field);

this.openDropdown = next;

this.cdr.detectChanges();

if (next) {
  this.scrollFilterToDropdown(next);
} else {
  this.scrollFilterToDropdown('apply');
}
}
  getFilteredOptions(options: string[], search: string): string[] {
    const term = String(search || '').toLowerCase().trim();
    if (!term) return options;
    return options.filter(item =>
      String(item || '').toLowerCase().includes(term)
    );
  }
getFilteredLangOptions(options: LangText[], search: string): LangText[] {
  const term = String(search || '').toLowerCase().trim();

  if (!term) return options;

  return options.filter(item =>
    this.getText(item).toLowerCase().includes(term)
  );
}
getFilteredCityOptions(): LangText[] {
  const search = String(this.searchTerms.location || '').toLowerCase().trim();
  const selectedState = String(this.filters.state || '').toLowerCase().trim();

  return this.cityOptions.filter((item: any) => {

    const cityName = this.getText(item).toLowerCase();

    const cityState = String(item.state || '').toLowerCase().trim();

    const matchesSearch =
      !search || cityName.includes(search);

    const matchesState =
      !selectedState || cityState === selectedState;

    return matchesSearch && matchesState;
  });
}
  getFilteredNumberOptions(options: number[], search: string): number[] {
    const term = String(search || '').toLowerCase().trim();
    if (!term) return options;
    return options.filter(item =>
      String(item).toLowerCase().includes(term)
    );
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.openDropdown = null;
  }

  trackByProfile(index: number, profile: ProfileItem): string {
    return profile.id || String(index);
  }
private scrollFilterToStart(): void {
  setTimeout(() => {
    const el = this.filterBarRef?.nativeElement as any;

    if (el) {
      el.scrollLeft = 0;
    }
  }, 150);
}
private scrollFilterToDropdown(name: string): void {
  setTimeout(() => {
    const item = document.querySelector(
      `[data-filter="${name}"]`
    ) as HTMLElement | null;

    if (item) {
      item.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest'
      });
    }
  }, 100);
}

  setTab(tab: TabType): void {
    this.activeTab = tab;
    this.openDropdown = null;
    this.cdr.detectChanges();
  }

applyFilters(forceClose?: boolean): void {

  this.appliedFilters = { ...this.filters };

  this.openDropdown = null;

  this.cdr.detectChanges();

  this.scrollFilterToStart();
}

  resetFilters(): void {
    this.filters = {
      caste: null,
      religion: null,
      gender: null,
      maritalStatus: null,
      location: null,
      education: null,
      profession: null,
      state: null,
      ageFrom: null,
      ageTo: null,
      radius: null
    };

    this.appliedFilters = { ...this.filters };

this.searchTerms = {
  ageFrom: '',
  ageTo: '',
  religion: '',
  caste: '',
  gender: '',
  maritalStatus: '',
  location: '',
  education: '',
   profession: '',
  state: '',
  radius: ''
};
   this.openDropdown = null;
this.mobileFilterOpen = false;
this.cdr.detectChanges();

this.scrollFilterToStart();
  }

  async viewProfile(profile: ProfileItem): Promise<void> {
    if (!profile?.id) {
     this.snackbar.error('Profile ID missing');
      return;
    }

    if (!this.hasRealProfileCode(profile.id)) {
      this.snackbar.error(this.tr.alerts.invalidProfileCode);
      return;
    }

    if (this.isBrowser) {
      const viewedKey = this.getUserStorageKey('tm_viewed_profiles');
      const viewedIds = JSON.parse(localStorage.getItem(viewedKey) || '[]') as string[];

      if (!viewedIds.includes(profile.id)) {
        viewedIds.push(profile.id);
        localStorage.setItem(viewedKey, JSON.stringify(viewedIds));
      }
    }

    const currentUserId = this.getLoggedInUserId();

    if (!currentUserId) {
      this.snackbar.error(this.tr.alerts.loginRequired);
      this.router.navigate(['/login'], {
        queryParams: {
          from: 'profiles',
          profileId: profile.id,
          profileName: this.getText(profile.name)
        }
      });
      return;
    }

    await this.loadCurrentPlanFromSupabase();

    let isUnlocked = true;

    if (this.planExpired || this.remainingProfiles <= 0 || !this.currentSubscriptionId) {
      isUnlocked = false;
    }

    if (!isUnlocked) {
      this.router.navigate(['/profile-view'], {
        queryParams: {
          unlocked: false,
          profileId: String(profile.id).trim(),
          profileName: this.getText(profile.name),
          selectedPlan: this.currentPlan.name
        }
      });
      return;
    }

   const viewedKey = this.getUserStorageKey('tm_unlocked_profiles');

const unlockedProfiles = JSON.parse(
  localStorage.getItem(viewedKey) || '[]'
) as string[];

const alreadyUnlocked = unlockedProfiles.includes(profile.id);

let newViewedCount = this.currentPlan.viewed;

let expiredAfterView = false;

if (!alreadyUnlocked) {

  unlockedProfiles.push(profile.id);

  localStorage.setItem(
    viewedKey,
    JSON.stringify(unlockedProfiles)
  );

  newViewedCount = this.currentPlan.viewed + 1;

  expiredAfterView =
    this.currentPlan.limit > 0 &&
    newViewedCount >= this.currentPlan.limit;
}

    try {
    if (!alreadyUnlocked) {

  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      contacts_used: newViewedCount,
      is_active: !expiredAfterView,
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', this.currentSubscriptionId);

  if (updateError) {
    throw updateError;
  }

}
      this.currentPlan.viewed = newViewedCount;

      if (expiredAfterView) {
        this.currentPlan.expired = true;
        this.currentPlan.daysLeft = 0;
      }

      this.cdr.detectChanges();

      this.router.navigate(['/profile-view'], {
        queryParams: {
          unlocked: isUnlocked,
          profileId: String(profile.id).trim(),
          profileName: this.getText(profile.name),
          selectedPlan: this.currentPlan.name
        }
      });
    } catch (error: any) {
      console.error('Update view count error:', error);
      this.snackbar.error(error?.message || 'Failed to update subscription usage');
    }
  }
instantLike(event: MouseEvent, profile: ProfileItem): void {
  event.preventDefault();
  event.stopPropagation();

  this.likeProfile(profile);
}
async likeProfile(profile: ProfileItem): Promise<void> {
  const userId = this.getLoggedInUserId();

  if (!userId) {
    this.snackbar.error('Please login first');
    return;
  }

  const oldLiked = profile.liked;
  const targetProfileId = String(profile.profileId);

  // FAST UI UPDATE FIRST
  profile.liked = !oldLiked;

  if (profile.liked) {
    this.likedProfileIdSet.add(targetProfileId);
  } else {
    this.likedProfileIdSet.delete(targetProfileId);
  }

  this.likedProfilesCount = this.likedProfileIdSet.size;
  this.cdr.detectChanges();

  try {
    const { data: myProfile, error: myProfileError } = await supabase
      .from('user_profiles')
      .select('profile_id')
      .eq('user_id', userId)
      .single();

    if (myProfileError) throw myProfileError;
    if (!myProfile?.profile_id) throw new Error('My profile not found');

    const myProfileId = String(myProfile.profile_id);

    if (profile.liked) {
      const { error } = await supabase
        .from('profile_likes')
        .upsert(
          {
            from_profile_id: myProfileId,
            to_profile_id: targetProfileId
          },
          { onConflict: 'from_profile_id,to_profile_id' }
        );

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('profile_likes')
        .delete()
        .eq('from_profile_id', myProfileId)
        .eq('to_profile_id', targetProfileId);

      if (error) throw error;
    }

    await this.loadLikedProfiles();

  } catch (err: any) {
    // rollback if failed
    profile.liked = oldLiked;

    if (oldLiked) {
      this.likedProfileIdSet.add(targetProfileId);
    } else {
      this.likedProfileIdSet.delete(targetProfileId);
    }

    this.likedProfilesCount = this.likedProfileIdSet.size;
    this.cdr.detectChanges();

    console.error('LIKE ERROR:', err);
    this.snackbar.error(err?.message || 'Failed to update like');
  }
}
  async sendInterest(profile: ProfileItem): Promise<void> {
    const userId = this.getLoggedInUserId();

    if (!userId) {
      this.snackbar.error('Please login first');
      this.router.navigate(['/login']);
      return;
    }

    const { error } = await supabase
      .from('matrimony_interests')
      .insert({
        from_user_id: userId,
        to_profile_id: profile.id,
        status_code: 'pending'
      });

    if (error) {
      if (error.code === '23505') {
        this.snackbar.error('Already sent interest');
        return;
      }

      console.error('Error:', error);
      this.snackbar.error('Failed to send interest');
      return;
    }

    alert('Interest sent successfully');
  }

  upgradePlan(): void {
    this.router.navigate(['/plans']);
  }
async loadLoggedInUserProfile(): Promise<void> {

  const userId = this.getLoggedInUserId();

  if (!userId) return;

  const { data, error } = await supabase
    .from('user_profiles')
 .select(`
  full_name,
  full_name_ta,
  profile_image_url,
  gender_text,
  caste_text,
  nakshatra_text,
  nakshatra_text_ta,
  latitude,
  longitude
`)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return;
  }

this.userProfileName =
  this.currentLang === 'ta'
    ? (data?.full_name_ta || data?.full_name || '')
    : (data?.full_name || data?.full_name_ta || '');
      this.userProfileImage = data?.profile_image_url || '';
 this.userGender = data?.gender_text || '';
this.userCaste = data?.caste_text || '';
this.userNakshatra =
  data?.nakshatra_text ||
  data?.nakshatra_text_ta ||
  '';
this.userLat = this.toNullableNumber(data?.latitude);
this.userLng = this.toNullableNumber(data?.longitude);
console.log('USER LAT:', this.userLat);
console.log('USER LNG:', this.userLng);
console.log('PROFILE DATA:', data);
this.geoLocationReady = this.userLat !== null && this.userLng !== null;
  this.cdr.detectChanges();
}
  renewPlan(): void {
    this.router.navigate(['/plans']);
  }
  async refreshUserProfileLanguage(): Promise<void> {

  const userId = this.getLoggedInUserId();

  if (!userId) return;

  const { data } = await supabase
    .from('user_profiles')
    .select('full_name, full_name_ta')
    .eq('user_id', userId)
    .maybeSingle();

  this.userProfileName =
    this.currentLang === 'ta'
      ? (data?.full_name_ta || data?.full_name || '')
      : (data?.full_name || data?.full_name_ta || '');

  this.cdr.detectChanges();
}
}
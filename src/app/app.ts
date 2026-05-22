import {
  Component,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { SnackbarComponent } from './shared/snackbar/snackbar';

type Language = 'en' | 'ta';

@Component({
  selector: 'app-root',
  standalone: true,
imports: [
  CommonModule,
  RouterLink,
  RouterOutlet,
  SnackbarComponent
],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
    private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private isBrowser = isPlatformBrowser(this.platformId);
showFooter = true;
isAdminPage = false;
menuOpen = false;
biodataMenuOpen = false;
currentLang: Language = 'en';
isNavigating = false;

interestNotificationCount = 0;
receivedInterestCount = 0;
sentInterestCount = 0;
receivedInterestTotal = 0;
sentInterestTotal = 0;
  translations: Record<Language, any> = {
    en: {
      nav: {
        home: 'Home',
        profiles: 'Find your match',
        plans: 'Plans',
        terms: 'Terms',
        login: 'Login',
        register: 'Register',
        biodata: 'Create Biodata',
        logout: 'Logout'
      },
      footer: {
        aboutTitle: 'ASTRO ❤ ALLIANCE',
        aboutText:
          'Trusted matrimony platform helping families and individuals find genuine and meaningful life partners.',
        quickLinks: 'Quick Links',
        contact: 'Contact',
        followUs: 'Follow Us',
        home: 'Home',
        profiles: 'Profiles',
        plans: 'Plans',
        terms: 'Terms & Conditions',
        login: 'Login',
        register: 'Register',
        location: '📍 Madurai, Tamil Nadu',
        phone: '📞 +91 90421 11424',
        email: '✉️ support@thirumagal.com',
        copyright: '© 2026 Astro Alliance. All Rights Reserved.'
      }
    },
    ta: {
      nav: {
        home: 'ஹோம்',
        profiles: 'மேட்ச்சஸ்',
        plans: 'திட்டம்',
        terms: 'விதிமுறைகள்',
        login: 'உள்நுழைவு',
        register: 'பதிவு',
        biodata: 'பயோடேட்டா உருவாக்கு',
        logout: 'வெளியேறு'
      },
      footer: {
        aboutTitle: 'திருமகள் ❤ மேட்ரிமோனி',
        aboutText:
          'குடும்பங்களும் தனிநபர்களும் உண்மையான மற்றும் அர்த்தமுள்ள வாழ்க்கைத் துணையை கண்டுபிடிக்க உதவும் நம்பகமான திருமண தளம்.',
        quickLinks: 'விரைவு இணைப்புகள்',
        contact: 'தொடர்பு',
        followUs: 'எங்களை பின்தொடருங்கள்',
        home: 'ஹோம்',
        profiles: 'மேட்ச்சஸ்',
        plans: 'திட்டம்',
        terms: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
        login: 'உள்நுழைவு',
        register: 'பதிவு',
        location: '📍 மதுரை, தமிழ்நாடு',
        phone: '📞 +91 90421 11424',
        email: '✉️ support@thirumagal.com',
        copyright: '© 2026 திருமகள் மேட்ரிமோனி. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'
      }
    }
  };

constructor() {
  if (this.isBrowser) {
    const savedLang = localStorage.getItem('tm_language') as Language | null;

    if (savedLang === 'en' || savedLang === 'ta') {
      this.currentLang = savedLang;
    }

    this.loadInterestNotificationCount();

this.router.events.subscribe((event) => {
  if (event instanceof NavigationEnd) {

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    if (event.urlAfterRedirects.includes('/received-interests')) {
      this.markReceivedInterestsSeen();
    }

    if (event.urlAfterRedirects.includes('/sent-interests')) {
      this.markSentInterestsSeen();
    }
   const currentUrl = event.urlAfterRedirects;
   this.isAdminPage =
  currentUrl.includes('/admin');

this.showFooter =
  currentUrl === '/' ||
  currentUrl.includes('/plans');
  }
  
});
  }
}

  get t() {
    return this.translations[this.currentLang];
  }

  get isLoggedIn(): boolean {
    if (!this.isBrowser) return false;

    const rawUser = localStorage.getItem('matrimony_user');
    const appUserId = localStorage.getItem('app_user_id');

    return !!rawUser || !!appUserId;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.biodataMenuOpen = false;
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.biodataMenuOpen = false;
  }

  toggleBiodataMenu(): void {
    this.biodataMenuOpen = !this.biodataMenuOpen;
  }

async changeLanguage(lang: Language): Promise<void> {

  const activeComponent: any =
    (window as any).activeBiodataComponent;

  const activeProfileViewComponent: any =
    (window as any).activeProfileViewComponent;

  if (activeComponent?.onLanguageSwitch) {
    await activeComponent.onLanguageSwitch(lang);
  }

  this.currentLang = lang;

  if (this.isBrowser) {
    localStorage.setItem('tm_language', lang);

    window.dispatchEvent(
      new CustomEvent('app-language-changed', {
        detail: lang
      })
    );
  }

  if (
    activeProfileViewComponent &&
    lang === 'ta'
  ) {
    await activeProfileViewComponent.translateProfileValuesToTamil();
  }

  this.closeMenu();
}
  // ✅ NEW FUNCTION (DOUBLE CLICK FIX)
  goToPage(path: string): void {
    if (this.isNavigating) return;

    this.isNavigating = true;
    this.closeMenu();

    this.router.navigate([path]).finally(() => {
      setTimeout(() => {
        this.isNavigating = false;
      }, 600);
    });
  }
async loadInterestNotificationCount(): Promise<void> {

  if (!this.isBrowser || !this.isLoggedIn) return;

  const rawUser = localStorage.getItem('matrimony_user');

  let userId =
    localStorage.getItem('app_user_id') || '';

  if (!userId && rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      userId = parsed?.user_id || '';
    } catch {}
  }

  if (!userId) return;

  const { supabase } = await import('./core/supabase.client');

  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('profile_code')
    .eq('user_id', userId)
    .maybeSingle();

  const profileCode = String(
    profileData?.profile_code || ''
  ).trim();

  if (!profileCode) {
    this.interestNotificationCount = 0;
    this.receivedInterestCount = 0;
    this.sentInterestCount = 0;
    return;
  }

  // RECEIVED
  const { count: receivedTotal } = await supabase
    .from('matrimony_interests')
    .select('*', { count: 'exact', head: true })
    .eq('to_profile_id', profileCode);
this.receivedInterestTotal = receivedTotal || 0;
  // SENT
  const { count: sentTotal } = await supabase
    .from('matrimony_interests')
    .select('*', { count: 'exact', head: true })
    .eq('from_user_id', userId);
this.sentInterestTotal = sentTotal || 0;
const seenReceived = Number(
  localStorage.getItem('seen_received_interest_count') || 0
);

const seenSent = Number(
  localStorage.getItem('seen_sent_interest_count') || 0
);

this.receivedInterestCount =
  Math.max((receivedTotal || 0) - seenReceived, 0);

this.sentInterestCount =
  Math.max((sentTotal || 0) - seenSent, 0);

  this.interestNotificationCount =
    this.receivedInterestCount +
    this.sentInterestCount;
}
markReceivedInterestsSeen(): void {
  localStorage.setItem(
    'seen_received_interest_count',
    String(this.receivedInterestTotal)
  );

  this.receivedInterestCount = 0;
  this.interestNotificationCount =
    this.receivedInterestCount + this.sentInterestCount;
}

markSentInterestsSeen(): void {
  localStorage.setItem(
    'seen_sent_interest_count',
    String(this.sentInterestTotal)
  );

  this.sentInterestCount = 0;
  this.interestNotificationCount =
    this.receivedInterestCount + this.sentInterestCount;
}
openReceivedInterests(): void {

  this.markReceivedInterestsSeen();

  this.closeMenu();

  this.goToPage('/received-interests');
}
openSentInterests(): void {

  this.markSentInterestsSeen();

  this.closeMenu();

  this.goToPage('/sent-interests');
}
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('matrimony_user');
      localStorage.removeItem('app_user_id');
    }

    this.closeMenu();
    this.router.navigate(['/login']);
  }
}
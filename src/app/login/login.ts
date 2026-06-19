import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { App } from '../app';
import { supabase } from '../core/supabase.client';
import { SnackbarService } from '../shared/snackbar.service';

type LoginType = 'user' | 'admin';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  app = inject(App);
cdr = inject(ChangeDetectorRef);
  constructor(
  private router: Router,
  private snackbar: SnackbarService
)  {}

  phone = '';
  dob = '';
  
  maxDate = new Date(
  new Date().setFullYear(new Date().getFullYear() - 18)
).toISOString().split('T')[0];
  isLoading = false;
  loginType: LoginType = 'user';

 

  translations = {
    en: {
      left: {
        tag: 'Welcome Back',
        title: 'Find your perfect match with ASTRO ALLIANCE',
        subtitle:
          'Login to access verified profiles, manage your account, and continue your journey toward a meaningful relationship.',
        points: [
          'Trusted matrimony platform',
          'Secure and private profile access',
          'Verified and genuine connections'
        ]
      },
      form: {
        miniTitle: 'Sign In',
        title: 'Login to Your Account',
        subtitle: 'Enter your details below to continue.',
        phone: 'Phone Number',
        phonePlaceholder: 'Enter your number',
        dob: 'DOB',
        loginBtn: 'Login Now',
        loggingIn: 'Logging in...',
        or: 'or continue with',
        registerText: "Don’t have an account?",
        registerBtn: 'Register Now'
      },
      alerts: {
        fillAll: 'Please fill all fields.',
        userNotFound: 'User not found.',
        dobMismatch: 'DOB does not match.',
        loginSuccess: 'Login successful.',
        adminLoginSuccess: 'Admin login successful.',
        adminInvalid: 'Invalid admin credentials.',
        googleLoginFailed: 'Google login failed.',
        somethingWrong: 'Something went wrong. Please try again.'
      }
    },
    ta: {
      left: {
        tag: 'மீண்டும் வரவேற்கிறோம்',
        title: 'ASTRO ALLIANCE மூலம் உங்கள் சரியான துணையை கண்டுபிடிக்கவும்',
        subtitle:
          'சரிபார்க்கப்பட்ட சுயவிவரங்களை அணுக, உங்கள் கணக்கை நிர்வகிக்க மற்றும் உங்கள் வாழ்க்கை பயணத்தை தொடர உள்நுழையவும்.',
        points: [
          'நம்பகமான மேட்ரிமோனி தளம்',
          'பாதுகாப்பான மற்றும் தனிப்பட்ட சுயவிவர அணுகல்',
          'சரிபார்க்கப்பட்ட உண்மையான தொடர்புகள்'
        ]
      },
      form: {
        miniTitle: 'உள்நுழைவு',
        title: 'உங்கள் கணக்கில் உள்நுழைக',
        subtitle: 'தொடர உங்கள் விவரங்களை கீழே உள்ளிடவும்.',
        phone: 'தொலைபேசி எண்',
        phonePlaceholder: 'உங்கள் எண்ணை உள்ளிடவும்',
        dob: 'பிறந்த தேதி',
        loginBtn: 'இப்போது உள்நுழைக',
        loggingIn: 'உள்நுழைகிறது...',
        or: 'அல்லது இதன்மூலம் தொடரவும்',
        registerText: 'உங்களுக்கு கணக்கு இல்லையா?',
        registerBtn: 'இப்போது பதிவு செய்யவும்'
      },
      alerts: {
        fillAll: 'அனைத்து விவரங்களையும் நிரப்பவும்.',
        userNotFound: 'பயனர் கிடைக்கவில்லை.',
        dobMismatch: 'பிறந்த தேதி பொருந்தவில்லை.',
        loginSuccess: 'உள்நுழைவு வெற்றி.',
        adminLoginSuccess: 'நிர்வாகி உள்நுழைவு வெற்றி.',
        adminInvalid: 'தவறான நிர்வாகி விவரங்கள்.',
        googleLoginFailed: 'Google உள்நுழைவு தோல்வி.',
        somethingWrong: 'ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
      }
    }
  };

  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  get tr() {
    return this.translations[this.currentLang];
  }

  setLoginType(type: LoginType): void {
    this.loginType = type;
    this.phone = '';
    this.dob = '';
  }

  private normalizePhone(value: string): string {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
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

  this.dob = value;

}

onMobileDatePick(event: any) {

  const value = event.target.value;

  if (!value) return;

  const [year, month, day] =
    value.split('-');

 this.dob =
  `${day}-${month}-${year}`;

const birthDate =
  new Date(`${year}-${month}-${day}`);

const today = new Date();

let age =
  today.getFullYear() -
  birthDate.getFullYear();

const monthDifference =
  today.getMonth() -
  birthDate.getMonth();

if (
  monthDifference < 0 ||
  (
    monthDifference === 0 &&
    today.getDate() < birthDate.getDate()
  )
) {
  age--;
}

if (age < 18) {

  this.dob = '';

  this.snackbar.error(
    'Age must be 18 or above'
  );

}

}
  private clearOldLoginStorage(): void {
    localStorage.removeItem('matrimony_user');
    localStorage.removeItem('matrimony_user_id');
    localStorage.removeItem('matrimony_profile_id');
    localStorage.removeItem('app_user_id');
    localStorage.removeItem('app_user_email');
    localStorage.removeItem('app_user_phone');
    localStorage.removeItem('selectedPlan');
    localStorage.removeItem('viewUnlocked');
    localStorage.removeItem('selectedProfileId');
    localStorage.removeItem('profileViewUnlocked');
    localStorage.removeItem('currentPlan');

    localStorage.removeItem('is_admin');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_phone');
  }



  private saveLoginUser(payload: {
    user_id: string;
    auth_user_id?: string | null;
    profile_id?: string | null;
    full_name: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number: string;
    dob: string;
    profile_image_url?: string;
    is_active?: boolean;
    legacy?: boolean;
  }): void {
    const loginUser = {
      user_id: payload.user_id,
      auth_user_id: payload.auth_user_id ?? null,
      profile_id: payload.profile_id ?? null,
      full_name: payload.full_name || '',
      first_name: payload.first_name || '',
      last_name: payload.last_name || '',
      email: payload.email || '',
      phone_number: payload.phone_number || '',
      dob: payload.dob || '',
      profile_image_url: payload.profile_image_url || '',
      is_active: payload.is_active ?? true,
      legacy: payload.legacy ?? false
    };

    localStorage.setItem('matrimony_user', JSON.stringify(loginUser));
    localStorage.setItem('matrimony_user_id', loginUser.user_id);
    localStorage.setItem('app_user_id', loginUser.user_id);
    localStorage.setItem('app_user_email', loginUser.email || '');
    localStorage.setItem('app_user_phone', loginUser.phone_number || '');

    if (loginUser.profile_id) {
      localStorage.setItem('matrimony_profile_id', loginUser.profile_id);
    }
  }

  private async handleAdminLogin(): Promise<void> {

  const cleanPhone = this.normalizePhone(this.phone);
  const cleanDob =
  this.dob.includes('-') &&
  this.dob.split('-')[0].length === 2
    ? this.dob.split('-').reverse().join('-')
    : this.dob;

  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('phone_number', cleanPhone)
    .eq('dob', cleanDob)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!admin) {
    this.stopLoading();
    this.snackbar.error(this.tr.alerts.adminInvalid);
    return;
  }

  this.clearOldLoginStorage();

  localStorage.setItem('is_admin', 'true');
  localStorage.setItem('admin_name', admin.admin_name);
  localStorage.setItem('admin_phone', admin.phone_number);
  localStorage.setItem('admin_id', admin.admin_id);
this.snackbar.success(this.tr.alerts.adminLoginSuccess);

setTimeout(() => {
  this.router.navigate(['/admin']);
}, 1000);
}
private stopLoading(): void {
  this.isLoading = false;
  this.cdr.detectChanges();
}
async onLogin() {
const cleanPhone = this.normalizePhone(this.phone);

if (!cleanPhone || cleanPhone.length !== 10) {
  this.stopLoading();
  this.snackbar.error('Please enter a valid 10 digit mobile number');
  return;
}

if (!this.dob) {
  this.stopLoading();
  this.snackbar.error('Please enter your date of birth');
  return;
}
const dobForAge =
  this.dob.includes('-') &&
  this.dob.split('-')[0].length === 2
    ? this.dob.split('-').reverse().join('-')
    : this.dob;

const birthDate = new Date(dobForAge);

if (isNaN(birthDate.getTime())) {
  this.stopLoading();
  this.snackbar.error('Please enter a valid date of birth');
  return;
}

const today = new Date();

let age =
  today.getFullYear() -
  birthDate.getFullYear();

const monthDifference =
  today.getMonth() -
  birthDate.getMonth();

if (
  monthDifference < 0 ||
  (
    monthDifference === 0 &&
    today.getDate() < birthDate.getDate()
  )
) {
  age--;
}

if (age < 18) {

  this.stopLoading();

  this.snackbar.error(
    'Age must be 18 or above'
  );

  return;
}
  this.isLoading = true;

  try {
    if (this.loginType === 'admin') {
      await this.handleAdminLogin();
      this.stopLoading();
      return;
    }

 
    const cleanDob =
  this.dob.includes('-') &&
  this.dob.split('-')[0].length === 2
    ? this.dob.split('-').reverse().join('-')
    : this.dob;

    const { data: appUser, error: appUserError } = await supabase
      .from('app_users')
      .select('user_id, auth_user_id, first_name, last_name, email, phone_number, is_active')
      .eq('phone_number', cleanPhone)
      .eq('is_active', true)
      .maybeSingle();

    if (appUserError) throw appUserError;

    if (appUser?.user_id) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('profile_id, user_id, full_name, dob, mobile, email, profile_image_url')
        .eq('user_id', appUser.user_id)
        .eq('dob', cleanDob)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        this.stopLoading();
        this.snackbar.error('Invalid mobile number or date of birth');
        return;
      }

      this.clearOldLoginStorage();

      const fullName =
        (profile.full_name && String(profile.full_name).trim()) ||
        `${appUser.first_name ?? ''} ${appUser.last_name ?? ''}`.trim();

      this.saveLoginUser({
        user_id: String(appUser.user_id),
        auth_user_id: appUser.auth_user_id || null,
        profile_id: profile.profile_id ? String(profile.profile_id) : null,
        full_name: fullName,
        first_name: appUser.first_name || '',
        last_name: appUser.last_name || '',
        email: appUser.email || profile.email || '',
        phone_number: appUser.phone_number || cleanPhone,
        dob: String(profile.dob || cleanDob),
        profile_image_url: profile.profile_image_url || '',
        is_active: appUser.is_active === true,
        legacy: false
      });


  this.snackbar.success(this.tr.alerts.loginSuccess);

setTimeout(() => {
  this.stopLoading();
  this.router.navigate(['/profiles']);
}, 1000);

return;
    }

    const { data: legacyProfile, error: legacyProfileError } = await supabase
      .from('user_profiles')
      .select('profile_id, user_id, full_name, dob, mobile, email, profile_image_url')
      .eq('mobile', cleanPhone)
      .eq('dob', cleanDob)
      .maybeSingle();

    if (legacyProfileError) throw legacyProfileError;

  if (!legacyProfile?.user_id) {

  const { data: userExists } = await supabase
    .from('user_profiles')
    .select('profile_id')
    .eq('mobile', cleanPhone)
    .maybeSingle();

 this.stopLoading();

  if (userExists) {
   this.snackbar.error('Invalid mobile number or date of birth');
  } else {
    this.snackbar.error('Invalid mobile number or date of birth');
  }

  return;
}

    this.clearOldLoginStorage();

    this.saveLoginUser({
      user_id: String(legacyProfile.user_id),
      auth_user_id: null,
      profile_id: legacyProfile.profile_id ? String(legacyProfile.profile_id) : null,
      full_name: String(legacyProfile.full_name || '').trim(),
      first_name: '',
      last_name: '',
      email: legacyProfile.email || '',
      phone_number: legacyProfile.mobile || cleanPhone,
      dob: String(legacyProfile.dob || cleanDob),
      profile_image_url: legacyProfile.profile_image_url || '',
      is_active: true,
      legacy: true
    });

this.snackbar.success(this.tr.alerts.loginSuccess);

setTimeout(() => {
  this.stopLoading();
  this.router.navigate(['/profiles']);
}, 1000);

return;
  } catch (error: any) {
   
    this.stopLoading();
    this.snackbar.error(error?.message || this.tr.alerts.somethingWrong);
  }
}
  async loginWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      
      this.snackbar.error(error?.message || this.tr.alerts.googleLoginFailed);
    }
  }
}
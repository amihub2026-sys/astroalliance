import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { App } from '../app';
import { supabase } from '../core/supabase.client';
import { SnackbarService } from '../shared/snackbar.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  app = inject(App);

constructor(
  private router: Router,
  private snackbar: SnackbarService
) {
  this.loadReligions();
}

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  profileFor = '';
  gender = '';
  age: number | null = null;
  dob = '';
  maxDate = new Date(
  new Date().setFullYear(new Date().getFullYear() - 18)
).toISOString().split('T')[0];
  religion = '';
  religionList: any[] = [];
  location = '';
  acceptedTerms = false;
  password = '';

  isLoading = false;
showTermsPopup = false;
allowOnlyNumbers(event: KeyboardEvent) {
  const charCode = event.which ? event.which : event.keyCode;

  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}

blockInvalidPaste(event: ClipboardEvent) {
  const pastedText = event.clipboardData?.getData('text') || '';

  if (!/^[0-9]+$/.test(pastedText)) {
    event.preventDefault();
  }
}
onProfileForChange(value: string) {

  if (value === 'Daughter' || value === 'Sister') {
    this.gender = this.tr.form.female;
    return;
  }

  if (value === 'Son' || value === 'Brother') {
    this.gender = this.tr.form.male;
    return;
  }

  this.gender = '';
}
  translations = {
    en: {
      left: {
        tag: 'Join ASTRO ALLIANCE',
        title: 'Create your matrimony profile today',
        subtitle:
          'Register now to connect with genuine profiles, explore matches, and start your journey toward a happy married life.',
        points: [
          'Create your profile in minutes',
          'Your details stay safe and private',
          'Find trusted and meaningful matches'
        ]
      },
      form: {
        miniTitle: 'Sign Up',
        title: 'Create Account',
        subtitle: 'Fill in your details to start your matrimony journey.',
        firstName: 'First Name',
        firstNamePlaceholder: 'Enter first name',
        lastName: 'Last Name',
        lastNamePlaceholder: 'Enter last name',
        email: 'Email Address',
        emailPlaceholder: 'Enter your email',
        phone: 'Phone Number',
        phonePlaceholder: 'Enter your phone number',
        gender: 'Gender',
        genderPlaceholder: 'Select Gender',
        male: 'Male',
        female: 'Female',
        age: 'Age',
        agePlaceholder: 'Enter your age',
        dob: 'Date of Birth',
        profileFor: 'Profile For',
profileForPlaceholder: 'Select',

self: 'Self',
daughter: 'Daughter',
son: 'Son',
sister: 'Sister',
brother: 'Brother',
relative: 'Relative',
friend: 'Friend',
        religion: 'Religion',
        religionPlaceholder: 'Select Religion',
        christian: 'Christian',
        hindu: 'Hindu',
        muslim: 'Muslim',
        location: 'Location',
        locationPlaceholder: 'Enter your city / location',
        terms: 'I agree to the Terms & Conditions',
        button: 'Create Account',
        creating: 'Creating Account...',
        bottomText: 'Already have an account?',
        loginNow: 'Login Now',
        password: 'Password',
        passwordPlaceholder: 'Enter password'
      },
    alerts: {
  fillAll: 'Please fill all required fields.',
  acceptTerms: 'Please accept the Terms & Conditions.',
  passwordShort: 'Password must be at least 6 characters.',
  ageInvalid: 'Please enter a valid age.',
  phoneInvalid: 'Phone number must be exactly 10 digits.',
  registerSuccess: 'Registration successful.',
  userCreateFail: 'User account was not created.',
  profileCreateFail: 'Account created, but profile creation failed.',
  somethingWrong: 'Something went wrong. Please try again.'
},
termsPopup: {
  title: 'Important Notice',
  message1: 'Please provide only correct and true information. Fake details, wrong photos, or misleading profile information are strictly not allowed.',
  message2: 'If any false information is found, we may suspend or permanently remove the account and take necessary action.',
  okButton: 'I Understand'
}
    },
    ta: {
      left: {
        tag: 'ASTRO ALLIANCE இல் சேருங்கள்',
        title: 'இன்றே உங்கள் மேட்ரிமோனி சுயவிவரத்தை உருவாக்குங்கள்',
        subtitle:
          'உண்மையான சுயவிவரங்களுடன் இணைய, பொருத்தங்களை பார்க்க, மகிழ்ச்சியான திருமண வாழ்க்கைக்கான உங்கள் பயணத்தை தொடங்க இப்போது பதிவு செய்யுங்கள்.',
        points: [
          'சில நிமிடங்களில் உங்கள் சுயவிவரத்தை உருவாக்குங்கள்',
          'உங்கள் விவரங்கள் பாதுகாப்பாகவும் தனிப்பட்டதாகவும் இருக்கும்',
          'நம்பகமான மற்றும் அர்த்தமுள்ள பொருத்தங்களை கண்டுபிடிக்கவும்'
        ]
      },
      form: {
        miniTitle: 'பதிவு',
        title: 'கணக்கு உருவாக்கவும்',
        subtitle: 'உங்கள் திருமண பயணத்தை தொடங்க உங்கள் விவரங்களை நிரப்பவும்.',
        firstName: 'முதல் பெயர்',
        firstNamePlaceholder: 'முதல் பெயரை உள்ளிடவும்',
        lastName: 'கடைசி பெயர்',
        lastNamePlaceholder: 'கடைசி பெயரை உள்ளிடவும்',
        email: 'மின்னஞ்சல் முகவரி',
        emailPlaceholder: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
        phone: 'தொலைபேசி எண்',
        phonePlaceholder: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
        gender: 'பாலினம்',
        genderPlaceholder: 'பாலினத்தை தேர்வு செய்யவும்',
        male: 'ஆண்',
        female: 'பெண்',
        age: 'வயது',
        agePlaceholder: 'உங்கள் வயதை உள்ளிடவும்',
        dob: 'பிறந்த தேதி',
        profileFor: 'சுயவிவரம் யாருக்காக',
profileForPlaceholder: 'தேர்வு செய்யவும்',

self: 'நான்',
daughter: 'மகள்',
son: 'மகன்',
sister: 'சகோதரி',
brother: 'சகோதரர்',
relative: 'உறவினர்',
friend: 'நண்பர்',
        religion: 'மதம்',
        religionPlaceholder: 'மதத்தை தேர்வு செய்யவும்',
        christian: 'கிறிஸ்துவர்',
        hindu: 'இந்துக்கள்',
        muslim: 'முஸ்லிம்',
        location: 'இடம்',
        locationPlaceholder: 'உங்கள் நகரம் / இடத்தை உள்ளிடவும்',
        terms: 'நான் விதிமுறைகள் மற்றும் நிபந்தனைகளை ஒப்புக்கொள்கிறேன்',
        button: 'கணக்கு உருவாக்கவும்',
        creating: 'கணக்கு உருவாக்கப்படுகிறது...',
        bottomText: 'ஏற்கனவே கணக்கு உள்ளதா?',
        loginNow: 'இப்போது உள்நுழைக',
        password: 'கடவுச்சொல்',
        passwordPlaceholder: 'கடவுச்சொல்லை உள்ளிடவும்'
      },
alerts: {
  fillAll: 'தேவையான அனைத்து விவரங்களையும் நிரப்பவும்.',
  acceptTerms: 'விதிமுறைகள் மற்றும் நிபந்தனைகளை ஒப்புக்கொள்ளவும்.',
  passwordShort: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.',
  ageInvalid: 'சரியான வயதை உள்ளிடவும்.',
  phoneInvalid: 'தொலைபேசி எண் சரியாக 10 இலக்கங்கள் இருக்க வேண்டும்.',
  registerSuccess: 'பதிவு வெற்றிகரமாக முடிந்தது.',
  userCreateFail: 'பயனர் கணக்கு உருவாக்கப்படவில்லை.',
  profileCreateFail: 'கணக்கு உருவானது, ஆனால் சுயவிவரம் உருவாக்கப்படவில்லை.',
  somethingWrong: 'ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
},
termsPopup: {
  title: 'முக்கிய அறிவிப்பு',
  message1: 'தயவுசெய்து சரியான மற்றும் உண்மையான தகவல்களை மட்டும் வழங்கவும். போலியான விவரங்கள், தவறான புகைப்படங்கள் அல்லது தவறான சுயவிவர தகவல்கள் அனுமதிக்கப்படாது.',
  message2: 'ஏதேனும் தவறான தகவல் கண்டறியப்பட்டால், உங்கள் கணக்கு தற்காலிகமாக நிறுத்தப்படலாம் அல்லது நிரந்தரமாக நீக்கப்படலாம். தேவையான நடவடிக்கையும் எடுக்கப்படும்.',
  okButton: 'புரிந்துகொண்டேன்'
}
    }
  };

  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  get tr() {
    return this.translations[this.currentLang];
  }
get dobLabel(): string {

  if (this.currentLang === 'ta') {

    if (this.profileFor === 'Self')
      return 'உங்கள் பிறந்த தேதி';

    if (this.profileFor === 'Daughter')
      return 'மகளின் பிறந்த தேதி';

    if (this.profileFor === 'Son')
      return 'மகனின் பிறந்த தேதி';

    if (this.profileFor === 'Sister')
      return 'சகோதரியின் பிறந்த தேதி';

    if (this.profileFor === 'Brother')
      return 'சகோதரரின் பிறந்த தேதி';

    if (this.profileFor === 'Relative')
      return 'உறவினரின் பிறந்த தேதி';

    if (this.profileFor === 'Friend')
      return 'நண்பரின் பிறந்த தேதி';

  } else {

    if (this.profileFor === 'Self')
      return 'Your Date of Birth';

    if (this.profileFor === 'Daughter')
      return "Daughter's Date of Birth";

    if (this.profileFor === 'Son')
      return "Son's Date of Birth";

    if (this.profileFor === 'Sister')
      return "Sister's Date of Birth";

    if (this.profileFor === 'Brother')
      return "Brother's Date of Birth";

    if (this.profileFor === 'Relative')
      return "Relative's Date of Birth";

    if (this.profileFor === 'Friend')
      return "Friend's Date of Birth";
  }

  return this.tr.form.dob;
}
  private normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
  }

  private normalizePhone(value: string): string {
    return value.trim();
  }

  private getFullName(): string {
    return `${this.firstName.trim()} ${this.lastName.trim()}`.trim();
  }
onTermsChange() {
  if (this.acceptedTerms) {
    this.showTermsPopup = true;
  }
}

closeTermsPopup() {
  this.showTermsPopup = false;
}
calculateAge() {

  if (!this.dob) {
    this.age = null;
    return;
  }

  let birthDate: Date;

  const parts = this.dob.split('-');

  if (parts.length === 3 && parts[0].length === 2) {
    // mobile format: dd-mm-yyyy
    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const year = Number(parts[2]);

    birthDate = new Date(year, month, day);
  } else {
    // desktop format: yyyy-mm-dd
    birthDate = new Date(this.dob);
  }

  if (isNaN(birthDate.getTime())) {
    this.age = null;
    return;
  }

  const today = new Date();

  let calculatedAge = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    calculatedAge--;
  }

  this.age = calculatedAge;
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
  this.calculateAge();

}
onMobileDatePick(event: any) {

  const value = event.target.value;

  if (!value) return;

  const [year, month, day] =
    value.split('-');

  this.dob =
    `${day}-${month}-${year}`;
    this.calculateAge();

}

async loadReligions(): Promise<void> {

  const { data, error } = await supabase
    .from('mst_religions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!error && data) {
    this.religionList = data;
  }

}

  async onRegister() {
  if (
  !this.firstName.trim() ||
  !this.phone.trim() ||
  !this.profileFor.trim() ||
  !this.gender.trim() ||
  !this.age ||
  !this.dob ||
  !this.religion.trim()
) {
       this.snackbar.error(this.tr.alerts.fillAll);
  return;
}
    if (!this.acceptedTerms) {
      this.snackbar.error(this.tr.alerts.acceptTerms);
      return;
    }

    // if (this.password.length < 6) {
    //   alert(this.tr.alerts.passwordShort);
    //   return;
    // }

   if (!this.age || this.age < 18) {
 this.snackbar.error('Age must be 18 or above');
  return;
}

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(this.phone.trim())) {
   this.snackbar.error(this.tr.alerts.phoneInvalid);
      return;
    }

    this.isLoading = true;

const cleanEmail = this.normalizeEmail(this.email);

const cleanPhone = this.normalizePhone(this.phone);

const generatedEmail =
  cleanEmail ||
  `${cleanPhone}@astroalliance.com`;

const fullName = this.getFullName();
    try {
     const { data: authData, error: authError } =
  await supabase.auth.signUp({
    email: generatedEmail,
    password: 'Astro@123'
  });

      if (authError) {
        throw authError;
      }

      const authUser = authData.user;

      if (!authUser?.id) {
        throw new Error(this.tr.alerts.userCreateFail);
      }

      const { data: appUser, error: appUserError } = await supabase
        .from('app_users')
        .insert([
          {
            auth_user_id: authUser.id,
            first_name: this.firstName.trim(),
            last_name: this.lastName.trim(),
            email: cleanEmail || generatedEmail,
            phone_number: cleanPhone,
            preferred_language_id: null,
            is_phone_verified: false,
            is_email_verified: false,
            is_active: true
          }
        ])
        .select('user_id, auth_user_id')
        .single();

      if (appUserError) {
        throw appUserError;
      }

      if (!appUser?.user_id) {
        throw new Error(this.tr.alerts.userCreateFail);
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: appUser.user_id,
            full_name: fullName,
             profile_for: this.profileFor.trim(),
            dob: this.dob,
            age: this.age,
            mobile: cleanPhone,
           email: cleanEmail || generatedEmail,
            gender_text: this.gender.trim(),
            religion_text: this.religion.trim(),
            location_text: this.location.trim(),
            address_line: this.location.trim(),
            profile_status: 'draft',
            is_verified: false,
            is_published: false,
            completion_percentage: 10
          }
        ]);

      if (profileError) {
        throw new Error(`${this.tr.alerts.profileCreateFail} ${profileError.message}`);
      }

      localStorage.setItem(
        'matrimony_user',
        JSON.stringify({
          user_id: appUser.user_id,
          full_name: fullName,
         email: cleanEmail || generatedEmail,
          phone_number: cleanPhone,
          dob: this.dob,
          profile_image_url: ''
        })
      );

      localStorage.setItem('app_user_id', appUser.user_id);
      localStorage.setItem(
  'app_user_email',
  cleanEmail || generatedEmail
);
      localStorage.setItem('app_user_phone', cleanPhone);

 this.snackbar.success(this.tr.alerts.registerSuccess);

setTimeout(() => {

  // ADMIN FLOW
  if (this.router.url.includes('create-user')) {

    localStorage.setItem(
      'admin_created_user_id',
      appUser.user_id
    );

    this.router.navigate([
      '/admin/create-biodata'
    ]);

  }

  // NORMAL USER FLOW
// NORMAL USER FLOW
else {

  localStorage.setItem(
    'biodata_pending',
    'true'
  );

  this.router.navigate([
    '/biodata'
  ]);

}

}, 1000);

    } catch (error: any) {
     this.snackbar.error(error?.message || this.tr.alerts.somethingWrong);
    } finally {
      this.isLoading = false;
    }
  }
}
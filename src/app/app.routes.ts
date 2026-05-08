import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { Profiles } from './profiles/profiles';
import { Plans } from './plans/plans';
import { Biodata } from './biodata/biodata';
import { ProfileView } from './profile-view/profile-view';
import { MyBiodataComponent } from './my-biodata/my-biodata';
import { authGuard } from './core/auth.guard';
import { PaymentPage } from './payment-page/payment-page';
import { Terms } from './terms/terms';
import { Admin } from './admin/admin';
import { ReceivedInterests } from './received-interests/received-interests';
import { SentInterests } from './sent-interests/sent-interests';
export const routes: Routes = [
  { path: '', component: Home },

  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profiles', component: Profiles },

  { path: 'plans', component: Plans, canActivate: [authGuard] },
  { path: 'biodata', component: Biodata, canActivate: [authGuard] },
  { path: 'profile-view', component: ProfileView, canActivate: [authGuard] },
  { path: 'my-biodata', component: MyBiodataComponent, canActivate: [authGuard] },
  { path: 'payment', component: PaymentPage, canActivate: [authGuard] },
  { path: 'terms', component: Terms },
{ path: 'received-interests', component: ReceivedInterests },
{ path: 'sent-interests', component: SentInterests },
  { path: 'admin', component: Admin},

  { path: '**', redirectTo: '' }
];